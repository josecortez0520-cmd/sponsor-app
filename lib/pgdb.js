const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set — Postgres disabled');
  module.exports = {
    getState: async () => ({ sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} }),
    saveState: async (state) => { console.warn('Postgres not configured — state not persisted'); }
  };
  return;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

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
          await client.query(`INSERT INTO sponsors(id, sponsorYear, name, company, contact, phone, type, amount, status, isContractSigned, isLogoReceived, isBannerPlaced, isPaymentReceived, notes, date)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
            ON CONFLICT DO NOTHING`, [s.id, s.sponsorYear, s.name, s.company, s.contact, s.phone, s.type, s.amount || 0, s.status, !!s.isContractSigned, !!s.isLogoReceived, !!s.isBannerPlaced, !!s.isPaymentReceived, s.notes || null, s.date ? s.date : new Date().toISOString()]);
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

async function saveState(state) {
  const client = await pool.connect();
  try {
    await client.query('UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1', [state]);
  } finally {
    client.release();
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
    const q = `INSERT INTO sponsors(id,sponsorYear,name,company,contact,phone,type,amount,status,isContractSigned,isLogoReceived,isBannerPlaced,isPaymentReceived,notes,date)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`;
    const values = [s.id, s.sponsorYear || null, s.name||null, s.company||null, s.contact||null, s.phone||null, s.type||null, s.amount||0, s.status||null, !!s.isContractSigned, !!s.isLogoReceived, !!s.isBannerPlaced, !!s.isPaymentReceived, s.notes||null, s.date||new Date().toISOString()];
    const res = await client.query(q, values);
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
    return res.rows[0] || null;
  } finally { client.release(); }
}

async function deleteSponsor(id) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM sponsors WHERE id = $1', [id]);
    return true;
  } finally { client.release(); }
}

init().catch(err => console.error('Postgres init error:', err));

module.exports = { getState, saveState };
