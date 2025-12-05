const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

let supabase = null;
function ensureClient() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_KEY required');
  supabase = createClient(url, key, { global: { fetch } });
  return supabase;
}

async function getState() {
  const sb = ensureClient();
  const { data, error } = await sb.from('app_state').select('state').eq('id', 'singleton').limit(1).single();
  if (error && error.code === 'PGRST116') {
    // table not found or other; return empty
    return {};
  }
  if (error) {
    console.error('supabase getState error', error);
    return {};
  }
  return data && data.state ? data.state : {};
}

async function saveState(state) {
  const sb = ensureClient();
  // create backup locally as extra safety
  try {
    const backupsDir = path.join(__dirname, '..', 'data', 'backups');
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
    fs.writeFileSync(path.join(backupsDir, `supabase-backup-${Date.now()}.json`), JSON.stringify(state, null, 2));
  } catch (e) { console.warn('unable to write local backup', e); }

  const { error } = await sb.from('app_state').upsert({ id: 'singleton', state }, { onConflict: 'id' });
  if (error) throw error;
}

// attempt a diff using sponsors table if present
async function diffState(incomingState) {
  const sb = ensureClient();
  const incomingSponsors = (incomingState && incomingState.sponsors) || [];
  const { data: existing, error } = await sb.from('sponsors').select('id');
  if (error) {
    return { message: 'sponsors table not available', upsertCount: incomingSponsors.length, deleteCount: 0 };
  }
  const existingIds = new Set(existing.map(r => r.id));
  const incomingIds = new Set(incomingSponsors.map(s => s.id));
  const toUpsert = incomingSponsors.filter(s => !s.id || !existingIds.has(s.id));
  const toDelete = existing.filter(r => !incomingIds.has(r.id)).map(r => r.id).slice(0, 20);
  return { upsertCount: toUpsert.length, deleteCount: Math.max(0, existing.length - incomingSponsors.length), sampleUpsertIds: toUpsert.slice(0,10).map(s=>s.id), sampleDeleteIds: toDelete };
}

// Basic normalized CRUD for sponsors via supabase
async function getSponsors() {
  const sb = ensureClient();
  const { data, error } = await sb.from('sponsors').select('*');
  if (error) throw error;
  return data;
}

async function createSponsor(s) {
  const sb = ensureClient();
  const { data, error } = await sb.from('sponsors').insert(s).select().single();
  if (error) throw error;
  return data;
}

async function updateSponsor(id, s) {
  const sb = ensureClient();
  const { data, error } = await sb.from('sponsors').update(s).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deleteSponsor(id) {
  const sb = ensureClient();
  const { error } = await sb.from('sponsors').delete().eq('id', id);
  if (error) throw error;
}

module.exports = {
  getState,
  saveState,
  diffState,
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor
};
