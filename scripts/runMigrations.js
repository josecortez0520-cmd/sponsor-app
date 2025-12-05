require('dotenv').config();
const fs = require('fs');
const path = require('path');

const createSql = `
CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO app_state (id, data, updated_at) VALUES (1, '{}'::jsonb, now()) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS sponsors (
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
);
`;

(async function run() {
  try {
    if (process.env.DATABASE_URL) {
      console.log('Running migrations using DATABASE_URL (pg)');
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      await client.query(createSql);
      // Ensure commonly added columns exist even when table existed previously
      try {
        await client.query("ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS eventtype TEXT");
      } catch (e) {
        // non-fatal
        console.warn('Could not ensure eventtype column:', e && e.message ? e.message : e);
      }
      await client.end();
      console.log('Migrations applied via Postgres connection.');
      return;
    }

    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      console.log('No DATABASE_URL found — attempting to touch Supabase via HTTP client.');
      try {
        const sb = require('../lib/supabase');
        // try to upsert singleton state (this will fail if table missing)
        await sb.saveState({});
        console.log('Supabase accept saveState (app_state exists). Note: sponsors table may still require SQL creation.');
        console.log('If sponsors table is missing, please run the SQL below in Supabase SQL editor:');
        console.log(createSql);
        return;
      } catch (e) {
        console.warn('Supabase upsert failed or tables missing. Please run the following SQL in Supabase SQL editor:');
        console.log(createSql);
        return;
      }
    }

    console.log('No DATABASE_URL or SUPABASE_* configured. Migration skipped.');
  } catch (err) {
    console.error('Migration error', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
