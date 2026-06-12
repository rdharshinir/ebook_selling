/**
 * watermarkService.js
 * Applies a diagonal watermark to every page of a PDF using pdf-lib.
 * Watermark is applied in-memory ONLY — never saved to disk or S3.
 */

const { PDFDocument, rgb, degrees } = require('pdf-lib');

/**
 * Stamps every page of a PDF with a customer watermark.
 *
 * @param {Buffer} pdfBuffer          - Raw PDF bytes from S3
 * @param {object} watermarkData
 * @param {string} watermarkData.customerName
 * @param {string} watermarkData.customerEmail
 * @returns {Promise<Uint8Array>} Watermarked PDF bytes
 */
async function applyWatermark(pdfBuffer, { customerName, customerEmail }) {
  const pdfDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });

  const pages = pdfDoc.getPages();
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const watermarkText = `${customerName} | ${customerEmail} | ${today}`;

  for (const page of pages) {
    const { width, height } = page.getSize();

    // ── Primary diagonal watermark (center of page) ─────────────────────────
    const fontSize = 22;
    const textWidth = watermarkText.length * fontSize * 0.52; // approximate
    const x = (width - textWidth) / 2;
    const y = height / 2;

    page.drawText(watermarkText, {
      x,
      y,
      size: fontSize,
      color: rgb(0.75, 0.75, 0.75),    // light gray
      opacity: 0.35,
      rotate: degrees(45),
    });

    // ── Secondary repeated watermarks (tiled for strong protection) ──────────
    const tileOffsets = [
      { dx: -180, dy: -180 },
      { dx: 180, dy: 180 },
      { dx: -180, dy: 180 },
      { dx: 180, dy: -180 },
      { dx: 0, dy: -230 },
      { dx: 0, dy: 230 },
    ];

    for (const { dx, dy } of tileOffsets) {
      page.drawText(watermarkText, {
        x: x + dx,
        y: y + dy,
        size: 14,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.2,
        rotate: degrees(45),
      });
    }

    // ── Footer stamp on each page ────────────────────────────────────────────
    const footerFontSize = 8;
    const footerText = `Licensed to: ${customerName} (${customerEmail}) — ${today}`;
    page.drawText(footerText, {
      x: 20,
      y: 10,
      size: footerFontSize,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.7,
    });
  }

  return pdfDoc.save();
}

module.exports = { applyWatermark };
