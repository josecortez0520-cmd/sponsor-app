#!/usr/bin/env node
/**
 * One-time migration: set state.profile.userId to desired value
 * Usage: node scripts/migrateSetProfileUserId.js
 */
const path = require('path');

const DESIRED_USERID = process.env.TARGET_USERID || process.env.SESSION_USERID || 'josecortez0520';

async function loadDb() {
  // Try Postgres helper first (it will fall back to sqlite helper on init error)
  try {
    const pg = require(path.join(__dirname, '..', 'lib', 'pgdb'));
    return pg;
  } catch (e) {
    try {
      const db = require(path.join(__dirname, '..', 'lib', 'db'));
      return db;
    } catch (err) {
      console.error('Failed to load any DB helper:', err);
      process.exit(1);
    }
  }
}

(async () => {
  console.log('Migration: setting profile.userId to', DESIRED_USERID);
  const db = await loadDb();
  try {
    const state = await Promise.resolve(db.getState());
    if (!state) {
      console.error('No state loaded; aborting');
      process.exit(1);
    }
    state.profile = state.profile || {};
    const before = state.profile.userId || null;
    state.profile.userId = DESIRED_USERID;
    await Promise.resolve(db.saveState(state));
    console.log('Migration complete. previous userId:', before, '-> now:', state.profile.userId);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
