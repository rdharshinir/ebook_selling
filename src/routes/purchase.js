/**
 * purchase.js
 * Route: POST /api/purchase
 * Creates a Purchase record and returns a secure reader URL.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/db');
const { signToken } = require('../services/tokenService');

/**
 * POST /api/purchase
 * Body: { customerId, bookId, expiresInDays (optional), maxOpens (optional) }
 *
 * Creates a Purchase record, signs a JWT, stores token, returns readerUrl.
 * Admin copies readerUrl and pastes into WhatsApp manually.
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      bookId,
      expiresInDays = null,
      maxOpens = 5,
    } = req.body;

    // ── Validate required fields ───────────────────────────────────────────
    if (!customerId || !bookId) {
      return res.status(400).json({
        success: false,
        error: 'customerId and bookId are required',
      });
    }

    // ── Verify customer and book exist ─────────────────────────────────────
    const [{ data: customer }, { data: book }] = await Promise.all([
      supabase.from('Customer').select('*').eq('id', customerId).single(),
      supabase.from('Book').select('*').eq('id', bookId).single(),
    ]);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    // ── Calculate expiry date ──────────────────────────────────────────────
    let expiresAt = null;
    if (expiresInDays !== null && Number(expiresInDays) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(expiresInDays));
    }

    // ── Create purchase record and sign JWT ────────────────────────────────
    const purchaseId = 'purchase-' + Date.now();
    const token = signToken(
      { purchaseId, customerId, bookId },
      expiresInDays
    );

    const { data: purchase, error } = await supabase.from('Purchase').insert({
      id: purchaseId,
      customerId,
      bookId,
      token,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      maxOpens: maxOpens ? Number(maxOpens) : 999999,
      openCount: 0,
      isRevoked: false,
      createdAt: new Date().toISOString()
    }).select().single();

    if (error) throw error;

    // ── Build reader URL dynamically based on the request host ─────────────
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const readerUrl = `${baseUrl}/api/read/viewer?token=${token}`;

    return res.status(201).json({
      success: true,
      token,
      readerUrl,
      purchase: {
        id: purchase.id,
        customerId,
        bookId,
        expiresAt,
        maxOpens: Number(maxOpens),
      },
    });
  } catch (err) {
    console.error('[POST /api/purchase] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message,
    });
  }
});

module.exports = router;
