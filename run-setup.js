const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync('setup.sql', 'utf8');
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  for (let s of statements) {
    await prisma.$executeRawUnsafe(s);
  }
  console.log('DB created successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
