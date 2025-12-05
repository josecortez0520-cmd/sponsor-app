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
try {
  db = require('./lib/db');
} catch (e) {
  console.error('Could not load DB module:', e.message || e);
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
app.get('/api/sponsors', (req, res) => {
  res.json([]);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SponsorHub running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  console.log(`\nTo access from other devices on your network:`);
  console.log(`  - Same WiFi: http://<your-ip>:${PORT}`);
  console.log(`  - Via Tailscale VPN: http://<your-tailscale-ip>:${PORT}`);
  console.log(`\nTo get your Tailscale IP, run: tailscale ip -4`);
});
