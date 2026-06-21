/**
 * migrate-store-columns.js
 * Adds description, price, and coverUrl columns to the Book table in Supabase.
 * Run once: node migrate-store-columns.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('🔧 Running store column migration...\n');

  // We use the Supabase REST API to run raw SQL via the RPC
  // Since Supabase JS client doesn't expose DDL directly, we use fetch
  const sql = `
    ALTER TABLE "Book"
      ADD COLUMN IF NOT EXISTS "description" TEXT,
      ADD COLUMN IF NOT EXISTS "price"       INTEGER DEFAULT 49900,
      ADD COLUMN IF NOT EXISTS "coverUrl"    TEXT;
  `;

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    // Fallback: try direct query via supabase-js
    console.log('RPC exec_sql not available, trying direct approach...');
    
    // Check current columns
    const { data: books, error } = await supabase
      .from('Book')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Cannot reach Book table:', error.message);
      process.exit(1);
    }

    const existingBook = books?.[0] || {};
    const hasDescription = 'description' in existingBook;
    const hasPrice = 'price' in existingBook;
    const hasCoverUrl = 'coverUrl' in existingBook;

    console.log('Current columns check:');
    console.log('  description:', hasDescription ? '✅ exists' : '❌ missing');
    console.log('  price:      ', hasPrice ? '✅ exists' : '❌ missing');
    console.log('  coverUrl:   ', hasCoverUrl ? '✅ exists' : '❌ missing');

    if (!hasDescription || !hasPrice || !hasCoverUrl) {
      console.log('\n⚠️  Columns are missing. Please run this SQL in your Supabase SQL Editor:');
      console.log('\n──────────────────────────────────────────────────────────────────');
      console.log(`ALTER TABLE "Book"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "price"       INTEGER DEFAULT 49900,
  ADD COLUMN IF NOT EXISTS "coverUrl"    TEXT;`);
      console.log('──────────────────────────────────────────────────────────────────\n');
      console.log('Go to: https://supabase.com/dashboard → SQL Editor → New Query');
    } else {
      console.log('\n✅ All columns already exist! No migration needed.');
    }
    return;
  }

  console.log('✅ Migration complete! Columns added to Book table.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
