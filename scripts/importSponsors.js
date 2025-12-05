#!/usr/bin/env node
// importSponsors.js
// Usage:
//   node scripts/importSponsors.js --file sponsors.json --url https://your-app.onrender.com \
//       --email you@example.com --password "your-password"

const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/importSponsors.js --file sponsors.json --url https://your-app.onrender.com --email you@example.com --password "your-password"');
}

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const file = argv.file || argv.f;
  const url = argv.url || argv.u;
  const email = argv.email || argv.e;
  const password = argv.password || argv.p;

  if (!file || !url || !email || !password) {
    usage();
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  let sponsors;
  try {
    sponsors = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(sponsors)) throw new Error('Expected JSON array');
  } catch (err) {
    console.error('Failed to read/parse sponsors file:', err.message);
    process.exit(1);
  }

  console.log(`Read ${sponsors.length} sponsors from ${filePath}`);

  // Login to deployed app and get session cookie
  const loginUrl = new URL('/login', url).toString();
  const loginBody = new URLSearchParams();
  loginBody.append('email', email);
  loginBody.append('password', password);

  console.log('Logging in to', loginUrl);
  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    body: loginBody,
    redirect: 'manual'
  });

  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    console.error('Login failed or no Set-Cookie header received. Status:', loginRes.status);
    const text = await loginRes.text();
    console.error('Response body:', text.slice(0, 200));
    process.exit(1);
  }

  // We'll send the raw set-cookie value for subsequent requests
  const cookieHeader = setCookie.split(';')[0];
  console.log('Got session cookie');

  // Post each sponsor
  const apiUrlBase = url.replace(/\/+$/, '');
  const endpoint = apiUrlBase + '/api/sponsors';

  let created = 0;
  for (let i = 0; i < sponsors.length; i++) {
    const s = sponsors[i];
    // retry up to 3 times
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
          },
          body: JSON.stringify(s)
        });
        if (res.ok) {
          const body = await res.json();
          process.stdout.write(`Imported ${i+1}/${sponsors.length}: ${body.id || body.company || body.name}\n`);
          created++;
          break;
        } else {
          const text = await res.text();
          console.error(`Failed import (attempt ${attempts}) for sponsor ${s.id || s.company || i}: Status ${res.status} - ${text.slice(0,200)}`);
          // if 4xx don't retry
          if (res.status >= 400 && res.status < 500) break;
        }
      } catch (err) {
        console.error(`Error importing sponsor (attempt ${attempts}):`, err.message);
      }
      // small delay before retry
      await new Promise(r => setTimeout(r, 500 * attempts));
    }
  }

  console.log(`Done. Created ${created} sponsors (of ${sponsors.length}).`);
}

// Ensure fetch and URLSearchParams exist (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node 18+ with global fetch.');
  process.exit(1);
}

// simple dependency check: minimist
try { require('minimist'); } catch (e) {
  console.error('Please install the dev dependency minimist: npm install minimist');
  process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
