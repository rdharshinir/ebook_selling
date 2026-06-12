/**
 * Prisma Seed Script
 * Creates test customer, test book, generates a purchase token,
 * and logs the readerUrl to open immediately.
 *
 * Run: node prisma/seed.js
 * (Make sure the server is running on BASE_URL first for the purchase call)
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. Create test customer ────────────────────────────────────────────────
  const customer = await prisma.customer.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      phone: '919999999999',
      email: 'test@example.com',
    },
  });
  console.log('✅ Customer created:', customer.id, '—', customer.name);

  // ── 2. Create test book ────────────────────────────────────────────────────
  const book = await prisma.book.create({
    data: {
      title: 'My First Ebook',
      s3Key: 'books/test.pdf',
    },
  });
  console.log('✅ Book created:', book.id, '—', book.title);

  // ── 3. Generate a purchase via the API ─────────────────────────────────────
  console.log('\n📡 Calling POST /api/purchase...');
  const res = await fetch(`${BASE_URL}/api/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: customer.id,
      bookId: book.id,
      expiresInDays: 30,
      maxOpens: 10,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Purchase failed: ${res.status} — ${text}`);
  }

  const data = await res.json();
  console.log('\n🎉 Purchase created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📖 Reader URL (open in browser):');
  console.log('   ', data.readerUrl);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Admin Dashboard:', `${BASE_URL}/api/admin/dashboard`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
