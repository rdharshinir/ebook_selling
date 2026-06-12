require('dotenv').config();
const { fetchStorageObject } = require('./src/services/storageService');
const { applyWatermark } = require('./src/services/watermarkService');

async function testPDF() {
  try {
    console.log("Fetching PDF from Supabase Storage...");
    const pdfBuffer = await fetchStorageObject("Training Guide.pdf");
    console.log("PDF fetched, size:", pdfBuffer.length);
    
    console.log("Applying watermark...");
    const watermarkedPdf = await applyWatermark(pdfBuffer, {
      customerName: "Test User",
      customerEmail: "test@example.com"
    });
    console.log("Watermark applied successfully! Final size:", watermarkedPdf.length);
  } catch (err) {
    console.error("PDF Processing Error:", err);
  }
}

testPDF();
