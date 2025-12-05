const path = require('path');
const fs = require('fs');
let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('better-sqlite3 not installed. Run `npm install better-sqlite3` to enable persistent storage.');
  // Provide a fallback in-memory stub so server doesn't crash.
  module.exports = {
    getState: async () => ({ sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} }),
    saveState: async (state) => { console.warn('SQLite not available — state not persisted'); }
  };
  return;
}

const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);

// Initialize table to store app state as JSON
db.prepare(`CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`).run();

// Ensure we always have one row with id=1
const row = db.prepare('SELECT data FROM app_state WHERE id = 1').get();
if (!row) {
  const initial = JSON.stringify({ sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} });
  db.prepare('INSERT INTO app_state(id, data, updated_at) VALUES (1, ?, ?)').run(initial, new Date().toISOString());
}

function getState() {
  const r = db.prepare('SELECT data FROM app_state WHERE id = 1').get();
  try {
    return JSON.parse(r.data);
  } catch (e) {
    return { sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} };
  }
}

function saveState(state) {
  const str = JSON.stringify(state);
  db.prepare('UPDATE app_state SET data = ?, updated_at = ? WHERE id = 1').run(str, new Date().toISOString());
}

module.exports = { getState, saveState };
