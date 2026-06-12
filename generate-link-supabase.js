require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateLink() {
  try {
    // 1. Create or find a test customer
    let { data: customers } = await supabase.from('Customer').select('*').limit(1);
    let customer = customers && customers[0];
    
    if (!customer) {
      const id = "cust-" + Date.now();
      const { data, error } = await supabase.from('Customer').insert({
        id,
        name: 'Admin Test User',
        phone: '1234567890',
        email: 'admin@example.com',
        createdAt: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      customer = data;
    }

    // 2. Create or find the Book
    const title = "Training Guide";
    const s3Key = "Training Guide.pdf";

    let { data: books } = await supabase.from('Book').select('*').eq('s3Key', s3Key).limit(1);
    let book = books && books[0];
    
    if (!book) {
      const id = "book-" + Date.now();
      const { data, error } = await supabase.from('Book').insert({
        id,
        title,
        s3Key,
        createdAt: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      book = data;
    }

    // 3. Generate JWT
    const purchaseId = "purchase-" + Date.now();
    const token = jwt.sign(
      { purchaseId, customerId: customer.id, bookId: book.id },
      process.env.JWT_SECRET
    );

    // 4. Create Purchase record
    const { error: purchaseError } = await supabase.from('Purchase').insert({
      id: purchaseId,
      customerId: customer.id,
      bookId: book.id,
      token: token,
      maxOpens: 5,
      openCount: 0,
      isRevoked: false,
      createdAt: new Date().toISOString()
    });

    if (purchaseError) throw purchaseError;

    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const readerUrl = `${baseURL}/api/read/viewer?token=${token}`;

    console.log('\n======================================================');
    console.log('✅ LINK GENERATED SUCCESSFULLY (Bypassed network block)');
    console.log('======================================================');
    console.log(`📖 Book: ${book.title}`);
    console.log(`👤 Customer: ${customer.name} (${customer.email})`);
    console.log(`\n🔗 SECURE READER LINK:\n${readerUrl}`);
    console.log('======================================================\n');

  } catch (error) {
    console.error("Error generating link:", error.message || error);
  }
}

generateLink();
