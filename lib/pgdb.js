const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set — Postgres disabled');
  module.exports = {
    getState: async () => ({ sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} }),
    saveState: async (state) => { console.warn('Postgres not configured — state not persisted'); }
  };
  return;
}

// Ensure SSL is enabled for managed Postgres (e.g. Supabase).
let sslOption = false;
if (process.env.NODE_ENV === 'production') {
  sslOption = { rejectUnauthorized: false };
} else if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co')) {
  // Supabase requires SSL even for local development connections
  sslOption = { rejectUnauthorized: false };
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: sslOption });

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const res = await client.query('SELECT id FROM app_state WHERE id = 1');
    if (res.rowCount === 0) {
      await client.query('INSERT INTO app_state(id, data, updated_at) VALUES (1, $1, now())', [JSON.stringify({ sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} })]);
    }
    // Ensure normalized sponsors table exists
    await client.query(`CREATE TABLE IF NOT EXISTS sponsors (
      id TEXT PRIMARY KEY,
      sponsorYear INTEGER,
      name TEXT,
      company TEXT,
      contact TEXT,
      phone TEXT,
      type TEXT,
      eventType TEXT,
      amount NUMERIC,
      status TEXT,
      isContractSigned BOOLEAN,
      isLogoReceived BOOLEAN,
      isBannerPlaced BOOLEAN,
      isPaymentReceived BOOLEAN,
      notes TEXT,
      date TIMESTAMPTZ
    )`);
    // Migrate JSONB sponsors into normalized table if empty
    const sponsorCount = await client.query('SELECT COUNT(*)::int AS cnt FROM sponsors');
    if (sponsorCount.rows[0].cnt === 0) {
      const stateRes = await client.query('SELECT data FROM app_state WHERE id = 1');
      if (stateRes.rowCount > 0) {
        const data = stateRes.rows[0].data;
        const sponsors = data.sponsors || [];
        for (const s of sponsors) {
          await client.query(`INSERT INTO sponsors(id, sponsorYear, name, company, contact, phone, type, eventType, amount, status, isContractSigned, isLogoReceived, isBannerPlaced, isPaymentReceived, notes, date)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            ON CONFLICT DO NOTHING`, [s.id, s.sponsorYear, s.name, s.company, s.contact, s.phone, s.type, s.eventType || null, s.amount || 0, s.status, !!s.isContractSigned, !!s.isLogoReceived, !!s.isBannerPlaced, !!s.isPaymentReceived, s.notes || null, s.date ? s.date : new Date().toISOString()]);
        }
      }
    }
  } finally {
    client.release();
  }
}

async function getState() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT data FROM app_state WHERE id = 1');
    if (res.rowCount === 0) return { sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} };
    return res.rows[0].data;
  } finally {
    client.release();
  }
}

const fs = require('fs');
const path = require('path');

async function saveState(state) {
  const client = await pool.connect();
  try {
    // Backup current app_state JSON to data/backups before applying changes
    try {
      const stashDir = path.join(__dirname, '..', 'data', 'backups');
      if (!fs.existsSync(stashDir)) fs.mkdirSync(stashDir, { recursive: true });
      const cur = await client.query('SELECT data FROM app_state WHERE id = 1');
      if (cur.rowCount > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = path.join(stashDir, `app_state-backup-${timestamp}.json`);
        try { fs.writeFileSync(filePath, JSON.stringify(cur.rows[0].data, null, 2), 'utf8'); } catch (e) { console.warn('Failed writing app_state backup', e); }
      }
    } catch (e) {
      console.warn('Backup before saveState failed', e);
    }

    // Start a transaction to update app_state and reconcile sponsors table
    await client.query('BEGIN');
    try {
      await client.query('UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1', [state]);

      // If the incoming state contains sponsors, reconcile normalized table
      const incoming = (state && state.sponsors) ? state.sponsors : null;
      let summary = { upserts: 0, deletes: 0 };
      if (Array.isArray(incoming)) {
        // Batch upsert in chunks for better performance
        const chunkSize = 100;
        for (let i = 0; i < incoming.length; i += chunkSize) {
          const chunk = incoming.slice(i, i + chunkSize).map(s => ({
            id: s.id || ('id-' + Math.random().toString(36).slice(2, 9)),
            sponsorYear: s.sponsorYear || null,
            name: s.name || null,
            company: s.company || null,
            contact: s.contact || null,
            phone: s.phone || null,
            type: s.type || null,
            eventType: s.eventType || null,
            amount: s.amount || 0,
            status: s.status || null,
            isContractSigned: !!s.isContractSigned,
            isLogoReceived: !!s.isLogoReceived,
            isBannerPlaced: !!s.isBannerPlaced,
            isPaymentReceived: !!s.isPaymentReceived,
            notes: s.notes || null,
            date: s.date || new Date().toISOString()
          }));
          // Build parameterized INSERT ... ON CONFLICT query for the chunk
          const cols = ['id','sponsorYear','name','company','contact','phone','type','eventType','amount','status','isContractSigned','isLogoReceived','isBannerPlaced','isPaymentReceived','notes','date'];
          const valuesSql = [];
          const params = [];
          let paramIdx = 1;
          for (const row of chunk) {
            const placeholders = [];
            for (const c of cols) {
              placeholders.push(`$${paramIdx++}`);
              params.push(row[c]);
            }
            valuesSql.push(`(${placeholders.join(',')})`);
          }
          const insertSql = `INSERT INTO sponsors(${cols.join(',')}) VALUES ${valuesSql.join(',')} ON CONFLICT (id) DO UPDATE SET sponsorYear = EXCLUDED.sponsorYear, name = EXCLUDED.name, company = EXCLUDED.company, contact = EXCLUDED.contact, phone = EXCLUDED.phone, type = EXCLUDED.type, eventType = EXCLUDED.eventType, amount = EXCLUDED.amount, status = EXCLUDED.status, isContractSigned = EXCLUDED.isContractSigned, isLogoReceived = EXCLUDED.isLogoReceived, isBannerPlaced = EXCLUDED.isBannerPlaced, isPaymentReceived = EXCLUDED.isPaymentReceived, notes = EXCLUDED.notes, date = EXCLUDED.date`;
          const res = await client.query(insertSql, params);
          summary.upserts += chunk.length;
        }

        // Delete normalized sponsors that are not present in incoming state
        const incomingIds = incoming.map(s => s.id).filter(Boolean);
        if (incomingIds.length === 0) {
          const delRes = await client.query('DELETE FROM sponsors');
          summary.deletes = delRes.rowCount || 0;
        } else {
          const delRes = await client.query('DELETE FROM sponsors WHERE NOT (id = ANY($1))', [incomingIds]);
          summary.deletes = delRes.rowCount || 0;
        }
      }

      await client.query('COMMIT');

      // Log applied summary
      try {
        const logDir = path.join(__dirname, '..', 'data', 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logPath = path.join(logDir, 'applied-changes.log');
        const entry = `${new Date().toISOString()} APPLY state: upserts=${summary.upserts} deletes=${summary.deletes}\n`;
        fs.appendFileSync(logPath, entry, 'utf8');
      } catch (e) { console.warn('Failed writing apply log', e); }

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
  }
}

// Return a diff/preview of what would be applied for a given state
async function diffState(state) {
  const client = await pool.connect();
  try {
    const incoming = (state && state.sponsors) ? state.sponsors : null;
    if (!Array.isArray(incoming)) return { upsertCount: 0, deleteCount: 0, sampleUpsertIds: [], sampleDeleteIds: [] };

    // get existing ids set
    const res = await client.query('SELECT id FROM sponsors');
    const existingIds = new Set(res.rows.map(r => r.id));
    const incomingIds = new Set(incoming.map(s => s.id).filter(Boolean));

    let upsertCount = 0;
    const sampleUpsertIds = [];
    for (const s of incoming) {
      if (!s.id || !existingIds.has(s.id)) {
        upsertCount++;
        if (sampleUpsertIds.length < 10) sampleUpsertIds.push(s.id || '(new)');
      }
    }

    let deleteCount = 0;
    const sampleDeleteIds = [];
    for (const id of existingIds) {
      if (!incomingIds.has(id)) {
        deleteCount++;
        if (sampleDeleteIds.length < 10) sampleDeleteIds.push(id);
      }
    }

    return { upsertCount, deleteCount, sampleUpsertIds, sampleDeleteIds };
  } finally {
    client.release();
  }
}

// Keep the JSON app_state.sponsors in sync with the normalized sponsors table
async function syncAppStateSponsors(client) {
  const mustRelease = !client;
  const c = client || (await pool.connect());
  try {
    const res = await c.query('SELECT * FROM sponsors ORDER BY company NULLS LAST, name');
    const sponsors = res.rows || [];
    // load current app_state
    const st = await c.query('SELECT data FROM app_state WHERE id = 1');
    let state = { sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} };
    if (st.rowCount > 0 && st.rows[0].data) state = st.rows[0].data;
    state.sponsors = sponsors;
    await c.query('UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1', [state]);
  } finally {
    if (mustRelease) c.release();
  }
}

// Sponsors CRUD
async function getSponsors() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM sponsors ORDER BY company NULLS LAST, name');
    return res.rows;
  } finally { client.release(); }
}

async function getSponsor(id) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM sponsors WHERE id = $1', [id]);
    return res.rows[0] || null;
  } finally { client.release(); }
}

async function createSponsor(s) {
  const client = await pool.connect();
  try {
    const q = `INSERT INTO sponsors(id, sponsorYear, name, company, contact, phone, type, eventType, amount, status, isContractSigned, isLogoReceived, isBannerPlaced, isPaymentReceived, notes, date)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`;
    const values = [s.id, s.sponsorYear || null, s.name||null, s.company||null, s.contact||null, s.phone||null, s.type||null, s.eventType||null, s.amount||0, s.status||null, !!s.isContractSigned, !!s.isLogoReceived, !!s.isBannerPlaced, !!s.isPaymentReceived, s.notes||null, s.date||new Date().toISOString()];
    const res = await client.query(q, values);
    // sync JSON app_state sponsors to reflect normalized table
    try { await syncAppStateSponsors(client); } catch (e) { console.warn('syncAppStateSponsors error', e); }
    return res.rows[0];
  } finally { client.release(); }
}

async function updateSponsor(id, updates) {
  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const k of Object.keys(updates)) {
      fields.push(`${k} = $${idx}`);
      values.push(updates[k]);
      idx++;
    }
    if (fields.length === 0) return null;
    values.push(id);
    const res = await client.query(`UPDATE sponsors SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    // sync JSON app_state sponsors to reflect normalized table
    try { await syncAppStateSponsors(client); } catch (e) { console.warn('syncAppStateSponsors error', e); }
    return res.rows[0] || null;
  } finally { client.release(); }
}

async function deleteSponsor(id) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM sponsors WHERE id = $1', [id]);
    // sync JSON app_state sponsors to reflect normalized table
    try { await syncAppStateSponsors(client); } catch (e) { console.warn('syncAppStateSponsors error', e); }
    return true;
  } finally { client.release(); }
}

init().catch(err => {
  console.error('Postgres init error:', err);
  try {
    // Fallback to local JSON/SQLite helper so app remains usable
    const fallback = require('./db');
    module.exports.getState = fallback.getState;
    module.exports.saveState = fallback.saveState;
    console.warn('Falling back to local storage (lib/db.js) due to Postgres init error');
  } catch (e) {
    console.error('Also failed to load local DB fallback:', e);
  }
});

module.exports = { getState, saveState, getSponsors, getSponsor, createSponsor, updateSponsor, deleteSponsor };
