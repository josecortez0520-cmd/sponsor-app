require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;

// Load credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Debug: Log if credentials are loaded (remove in production)
if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.error('ERROR: Missing environment variables!');
  console.error('ADMIN_EMAIL:', ADMIN_EMAIL ? 'Set' : 'MISSING');
  console.error('ADMIN_PASSWORD_HASH:', ADMIN_PASSWORD_HASH ? 'Set' : 'MISSING');
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
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
