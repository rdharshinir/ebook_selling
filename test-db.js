const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const books = await prisma.book.findMany();
    console.log("DB connection successful! Books:", books);
  } catch (err) {
    console.error("DB connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
