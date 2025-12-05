require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// Load credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Database helper (SQLite)
let db;
// Prefer Postgres when DATABASE_URL is present (Supabase, Render Postgres)
if (process.env.DATABASE_URL) {
  try {
    db = require('./lib/pgdb');
    console.log('Using Postgres for persistence');
  } catch (e) {
    console.error('Could not load Postgres DB module:', e.message || e);
  }
} else {
  try {
    db = require('./lib/db');
    console.log('Using SQLite for persistence');
  } catch (e) {
    console.error('Could not load SQLite DB module:', e.message || e);
  }
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Home page - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page (shows optional error from query string)
app.get('/login', (req, res) => {
  const { error } = req.query;
  const errorMessage = error ? 'Enter an email and password to continue.' : null;
  res.render('login', { error: errorMessage });
});

// Login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    req.session.userId = 'admin';
    req.session.email = email;
    return res.redirect('/dashboard');
  }
  
  return res.redirect('/login?error=1');
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Dashboard - Main application (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard');
});

// App state endpoints (protected)
app.get('/api/state', requireAuth, async (req, res) => {
  try {
    if (db && db.getState) {
      const state = await db.getState();
      return res.json(state);
    }
    return res.json({ sponsors: [], events: [], tasks: [], notes: [], assets: [], profile: {} });
  } catch (err) {
    console.error('GET /api/state error', err);
    res.status(500).json({ error: 'Unable to read state' });
  }
});

app.post('/api/state', requireAuth, async (req, res) => {
  try {
    const state = req.body || {};
    if (db && db.saveState) {
      await db.saveState(state);
      return res.json({ ok: true });
    }
    return res.status(500).json({ error: 'Persistence not available' });
  } catch (err) {
    console.error('POST /api/state error', err);
    res.status(500).json({ error: 'Unable to save state' });
  }
});

// API endpoints for data (future expansion)
// Sponsors endpoints (use Postgres normalized table when available)
app.get('/api/sponsors', requireAuth, async (req, res) => {
  try {
    if (db && db.getSponsors) {
      const sponsors = await db.getSponsors();
      return res.json(sponsors);
    }
    // fallback to state
    const state = db && db.getState ? await db.getState() : { sponsors: [] };
    return res.json(state.sponsors || []);
  } catch (err) {
    console.error('GET /api/sponsors error', err);
    res.status(500).json({ error: 'Unable to fetch sponsors' });
  }
});

app.post('/api/sponsors', requireAuth, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.id) payload.id = 'id-' + Math.random().toString(36).slice(2,9);
    if (db && db.createSponsor) {
      const created = await db.createSponsor(payload);
      return res.json(created);
    }
    // fallback: update full state
    const state = db && db.getState ? await db.getState() : { sponsors: [] };
    state.sponsors = state.sponsors || [];
    state.sponsors.push(payload);
    db && db.saveState && await db.saveState(state);
    return res.json(payload);
  } catch (err) {
    console.error('POST /api/sponsors error', err);
    res.status(500).json({ error: 'Unable to create sponsor' });
  }
});

app.put('/api/sponsors/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    if (db && db.updateSponsor) {
      const updated = await db.updateSponsor(id, updates);
      return res.json(updated);
    }
    const state = db && db.getState ? await db.getState() : { sponsors: [] };
    state.sponsors = state.sponsors || [];
    const idx = state.sponsors.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    state.sponsors[idx] = Object.assign({}, state.sponsors[idx], updates);
    db && db.saveState && await db.saveState(state);
    return res.json(state.sponsors[idx]);
  } catch (err) {
    console.error('PUT /api/sponsors/:id error', err);
    res.status(500).json({ error: 'Unable to update sponsor' });
  }
});

app.delete('/api/sponsors/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (db && db.deleteSponsor) {
      await db.deleteSponsor(id);
      return res.json({ ok: true });
    }
    const state = db && db.getState ? await db.getState() : { sponsors: [] };
    state.sponsors = (state.sponsors || []).filter(s => s.id !== id);
    db && db.saveState && await db.saveState(state);
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/sponsors/:id error', err);
    res.status(500).json({ error: 'Unable to delete sponsor' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SponsorHub running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`\nTo access from other devices on your network:`);
  console.log(`  - Same WiFi: http://<your-ip>:${PORT}`);
  console.log(`  - Via Tailscale VPN: http://<your-tailscale-ip>:${PORT}`);
  console.log(`\nTo get your Tailscale IP, run: tailscale ip -4`);
});
