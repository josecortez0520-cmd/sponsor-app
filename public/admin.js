// Admin client: dry-run, apply, backups, logs
async function q(selector) { return document.querySelector(selector); }

function showMessage(container, html) {
  container.innerHTML = html;
}

async function loadBackups() {
  const el = await q('#backups-list');
  try {
    const res = await fetch('/api/backups');
    const data = await res.json();
    if (!data.backups || data.backups.length === 0) {
      showMessage(el, '<p class="text-gray-600">No backups found.</p>');
      return;
    }
    const items = data.backups.map(f => `<div class="flex justify-between items-center py-1"><span class="truncate max-w-md">${f}</span><div class="flex gap-2"><a class="text-sm text-blue-600" href="/api/backups/${encodeURIComponent(f)}">Download</a><button data-file="${f}" class="restore-btn text-sm text-yellow-700">Restore</button></div></div>`).join('');
    showMessage(el, items);
    // wire restore buttons
    el.querySelectorAll('.restore-btn').forEach(b => b.addEventListener('click', async (ev) => {
      const file = ev.currentTarget.getAttribute('data-file');
      if (!file) return;
      // preview dry-run
      const out = await q('#dry-run-result');
      try {
        const dry = await fetch('/api/backups/restore', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ file }) });
        const dryJson = await dry.json();
        showMessage(out, `<pre class="whitespace-pre-wrap">${JSON.stringify(dryJson, null, 2)}</pre>`);
      } catch (e) { showMessage(out, `<div class="text-red-600">Dry-run failed: ${e}</div>`); }
      if (!confirm('Apply this backup now? Click OK to apply (force).')) return;
      try {
        const apply = await fetch('/api/backups/restore?force=true', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ file }) });
        const applyJson = await apply.json();
        alert(applyJson.ok ? 'Restore applied' : ('Restore failed: ' + (applyJson.error || JSON.stringify(applyJson))));
        await loadBackups();
        await loadLog();
      } catch (e) { alert('Restore failed: ' + e); }
    }));
  } catch (e) { showMessage(el, `<p class="text-red-600">Unable to load backups: ${e}</p>`); }
}

async function loadLog() {
  const el = await q('#applied-log');
  try {
    const res = await fetch('/api/logs/applied-changes');
    const data = await res.json();
    if (!data.entries || data.entries.length === 0) {
      showMessage(el, '<p class="text-gray-600">No log entries found.</p>');
      return;
    }
    const items = data.entries.map(l => `<div class="py-1 font-mono text-xs border-b">${l}</div>`).join('');
    showMessage(el, items);
  } catch (e) { showMessage(el, `<p class="text-red-600">Unable to load log: ${e}</p>`); }
}

async function loadCurrentState() {
  const ta = await q('#state-json');
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    ta.value = JSON.stringify(data, null, 2);
  } catch (e) { ta.value = `Error loading state: ${e}`; }
}

async function doDryRun() {
  const ta = await q('#state-json');
  const out = await q('#dry-run-result');
  try {
    const body = JSON.parse(ta.value);
    const res = await fetch('/api/state', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.dryRun) {
      showMessage(out, `<div><strong>Dry run</strong><div>Upsert count: ${data.diff.upsertCount || data.diff.upsertCount === 0 ? data.diff.upsertCount : data.diff.upsertCount}</div><div>Delete count: ${data.diff.deleteCount}</div><pre class="mt-2 bg-gray-50 p-2 rounded text-xs">Upserts sample: ${JSON.stringify(data.diff.sampleUpsertIds)}\nDeletes sample: ${JSON.stringify(data.diff.sampleDeleteIds)}</pre></div>`);
    } else {
      showMessage(out, `<div class="text-green-700">No diff info returned.</div>`);
    }
  } catch (e) { showMessage(out, `<div class="text-red-600">Dry-run failed: ${e}</div>`); }
}

async function doApply() {
  const ta = await q('#state-json');
  const out = await q('#dry-run-result');
  if (!confirm('This will apply the incoming state to the normalized sponsors and may delete rows not present. Proceed?')) return;
  try {
    const body = JSON.parse(ta.value);
    const res = await fetch('/api/state?force=true', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.applied) {
      showMessage(out, `<div class="text-green-700">Applied successfully.</div>`);
      await loadBackups();
      await loadLog();
    } else {
      showMessage(out, `<div class="text-yellow-700">Apply responded: ${JSON.stringify(data)}</div>`);
    }
  } catch (e) { showMessage(out, `<div class="text-red-600">Apply failed: ${e}</div>`); }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dry-run-btn').addEventListener('click', doDryRun);
  document.getElementById('apply-btn').addEventListener('click', doApply);
  document.getElementById('load-current-btn').addEventListener('click', loadCurrentState);
  // manual restore button (prompt)
  document.getElementById('admin-restore')?.addEventListener('click', async () => {
    const file = prompt('Enter backup filename to restore (or leave blank to cancel)');
    if (!file) return;
    const out = await q('#dry-run-result');
    try {
      const dry = await fetch('/api/backups/restore', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ file }) });
      const dryJson = await dry.json();
      showMessage(out, `<pre class="whitespace-pre-wrap">${JSON.stringify(dryJson, null, 2)}</pre>`);
    } catch (e) { showMessage(out, `<div class="text-red-600">Dry-run failed: ${e}</div>`); }
    if (!confirm('Apply this backup now?')) return;
    try {
      const apply = await fetch('/api/backups/restore?force=true', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ file }) });
      const applyJson = await apply.json();
      alert(applyJson.ok ? 'Restore applied' : ('Restore failed: ' + (applyJson.error || JSON.stringify(applyJson))));
      await loadBackups();
      await loadLog();
    } catch (e) { alert('Restore failed: ' + e); }
  });
  loadBackups();
  loadLog();
});
