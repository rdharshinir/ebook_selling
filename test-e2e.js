const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  try {
    console.log("Fetching customers...");
    const custRes = await request('GET', '/api/admin/customers');
    const customers = JSON.parse(custRes.body).customers;
    const customer = customers[0];

    console.log("Fetching books...");
    const bookRes = await request('GET', '/api/admin/books');
    const books = JSON.parse(bookRes.body).books;
    const book = books[0];

    if (!customer || !book) {
      console.log("Missing customer or book. Aborting test.");
      return;
    }

    console.log(`Generating link for Customer: ${customer.name}, Book: ${book.title}...`);
    const linkRes = await request('POST', '/api/purchase', {
      customerId: customer.id,
      bookId: book.id,
      maxOpens: 5
    });
    
    console.log(`POST /api/purchase status: ${linkRes.status}`);
    const purchaseData = JSON.parse(linkRes.body);
    
    if (!purchaseData.success) {
      console.error("Link generation failed:", purchaseData);
      return;
    }
    
    const readerUrl = purchaseData.readerUrl;
    console.log(`Link generated successfully! URL: ${readerUrl}`);
    
    console.log("Testing reader page...");
    const token = purchaseData.token;
    const readerPageRes = await request('GET', `/api/read/viewer?token=${token}`);
    
    console.log(`GET /api/read/viewer status: ${readerPageRes.status}`);
    if (readerPageRes.status === 200 && readerPageRes.body.includes('EbookVault Reader')) {
      console.log("✅ End-to-End Test PASSED: The reader page loaded successfully!");
      console.log(`\nHere is your working link:\n${readerUrl}\n`);
    } else {
      console.error("❌ End-to-End Test FAILED: Reader page did not return expected HTML.");
    }

  } catch (err) {
    console.error("Test error:", err);
  }
}

setTimeout(run, 2000); // Wait 2s for server to start
