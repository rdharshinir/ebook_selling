/**
 * add-store-columns.js
 * Uses Supabase Management API to add store columns to Book table.
 * Run once: node add-store-columns.js
 */

require('dotenv').config();

async function addColumns() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Extract project ref from URL: https://ppyiqzyzmooolbtsrnov.supabase.co
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  console.log(`Project ref: ${projectRef}`);

  const sql = `
ALTER TABLE "Book"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "price"       INTEGER DEFAULT 49900,
  ADD COLUMN IF NOT EXISTS "coverUrl"    TEXT;
  `;

  // Try Supabase pg-meta endpoint
  const url = `${supabaseUrl}/rest/v1/`;
  
  // Use the postgres REST endpoint via PostgREST with service role
  // This runs SQL by calling a stored procedure if available
  // Alternatively, use the pg-meta API
  const pgMetaUrl = `https://${projectRef}.supabase.co/pg/query`;
  
  console.log('Attempting via pg-meta...');
  
  // Try pg/query endpoint (available on some Supabase versions)
  let response = await fetch(pgMetaUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Migration succeeded via pg-meta!', data);
    return;
  }

  // If pg-meta doesn't work, try the SQL via supabase-js insert trick
  // by using a raw fetch to the PostgREST SQL endpoint
  console.log(`pg-meta failed (${response.status}), trying management API...`);
  
  // Supabase management API v1 (requires personal access token, not service key)
  // So we print the exact SQL for the user to run
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  ❗ Direct SQL migration via API requires a personal access token.');
  console.log('  Please run this SQL in Supabase Dashboard > SQL Editor:\n');
  console.log('  ALTER TABLE "Book"');
  console.log('    ADD COLUMN IF NOT EXISTS "description" TEXT,');
  console.log('    ADD COLUMN IF NOT EXISTS "price"       INTEGER DEFAULT 49900,');
  console.log('    ADD COLUMN IF NOT EXISTS "coverUrl"    TEXT;');
  console.log('\n  🔗 Direct link: https://supabase.com/dashboard/project/' + projectRef + '/editor');
  console.log('══════════════════════════════════════════════════════════════════\n');
}

addColumns().catch(err => {
  console.error('Error:', err.message);
});
