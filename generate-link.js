require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function generateLink() {
  try {
    // 1. Create or find a test customer
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: 'Admin Test User',
          phone: '1234567890',
          email: 'admin@example.com'
        }
      });
    }

    // 2. Create or find the Book
    const title = "Training Guide";
    const s3Key = "Training Guide.pdf"; // As requested

    let book = await prisma.book.findFirst({ where: { s3Key } });
    if (!book) {
      book = await prisma.book.create({
        data: { title, s3Key }
      });
    }

    // 3. Generate JWT
    const purchaseId = "purchase-" + Date.now();
    const token = jwt.sign(
      { purchaseId, customerId: customer.id, bookId: book.id },
      process.env.JWT_SECRET
    );

    // 4. Create Purchase record
    const purchase = await prisma.purchase.create({
      data: {
        id: purchaseId,
        customerId: customer.id,
        bookId: book.id,
        token: token,
        maxOpens: 5 // Default max opens
      }
    });

    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const readerUrl = `${baseURL}/api/read/viewer?token=${token}`;

    console.log('\n======================================================');
    console.log('✅ LINK GENERATED SUCCESSFULLY');
    console.log('======================================================');
    console.log(`📖 Book: ${book.title}`);
    console.log(`👤 Customer: ${customer.name} (${customer.email})`);
    console.log(`\n🔗 SECURE READER LINK:\n${readerUrl}`);
    console.log('======================================================\n');

  } catch (error) {
    console.error("Error generating link:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateLink();
