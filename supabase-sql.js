/**
 * supabase-sql.js
 * Runs arbitrary SQL against Supabase using the pg-meta /query endpoint.
 * Usage: node supabase-sql.js
 */

require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SQL = `
ALTER TABLE "Book"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "price"       INTEGER DEFAULT 49900,
  ADD COLUMN IF NOT EXISTS "coverUrl"    TEXT;
`;

// Extract host from URL
const host = SUPABASE_URL.replace('https://', '');

const payload = JSON.stringify({ query: SQL });

const options = {
  hostname: host,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
};

console.log('Sending SQL to Supabase...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', data);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ Migration succeeded!');
    } else {
      console.log('\n❌ Migration failed. Status:', res.statusCode);
      console.log('\n📋 Please run this SQL MANUALLY in Supabase SQL Editor:');
      console.log('   👉 https://supabase.com/dashboard/project/ppyiqzyzmooolbtsrnov/editor\n');
      console.log('ALTER TABLE "Book"');
      console.log('  ADD COLUMN IF NOT EXISTS "description" TEXT,');
      console.log('  ADD COLUMN IF NOT EXISTS "price"       INTEGER DEFAULT 49900,');
      console.log('  ADD COLUMN IF NOT EXISTS "coverUrl"    TEXT;');
    }
  });
});

req.on('error', err => {
  console.error('Request error:', err.message);
});

req.write(payload);
req.end();
