/**
 * razorpay.js
 * Routes:
 *   POST /api/razorpay/create-order — Create a Razorpay payment order
 *   POST /api/razorpay/verify       — Verify payment & trigger ebook delivery
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { supabase } = require('../services/db');
const { signToken } = require('../services/tokenService');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Lazily initialize Razorpay so server starts even if keys aren't set yet
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ─── POST /api/razorpay/create-order ─────────────────────────────────────────
router.post('/create-order', async (req, res) => {
  try {
    const { bookId, amount } = req.body;

    if (!bookId || !amount) {
      return res.status(400).json({ success: false, error: 'bookId and amount are required' });
    }

    // Verify book exists
    const { data: book, error: bookErr } = await supabase
      .from('Book')
      .select('id, title, price')
      .eq('id', bookId)
      .single();

    if (bookErr || !book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Number(amount), // amount in paise
      currency: 'INR',
      receipt: `order_${bookId}_${Date.now()}`,
      notes: { bookId, bookTitle: book.title },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('[POST /api/razorpay/create-order] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/razorpay/verify ────────────────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerEmail,
      bookId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    // ── 1. Verify Razorpay signature ──────────────────────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[verify] Signature mismatch');
      return res.status(400).json({ success: false, error: 'Payment verification failed — invalid signature' });
    }

    console.log(`[Razorpay] Payment verified: ${razorpay_payment_id}`);

    // ── 2. Fetch or create customer ───────────────────────────────────────────
    let { data: customer } = await supabase
      .from('Customer')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (!customer) {
      const custId = 'cust-' + Date.now();
      const { data: newCust, error: custErr } = await supabase
        .from('Customer')
        .insert({
          id: custId,
          email: customerEmail,
          name: customerName || 'Customer',
          phone: null,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (custErr) throw custErr;
      customer = newCust;
      console.log(`[Razorpay] Created new customer: ${customerEmail}`);
    }

    // ── 3. Fetch book ─────────────────────────────────────────────────────────
    const { data: book, error: bookErr } = await supabase
      .from('Book')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookErr || !book) {
      throw new Error(`Book ${bookId} not found after payment`);
    }

    // ── 4. Create Purchase & Token ────────────────────────────────────────────
    const purchaseId = 'purchase-' + Date.now();
    const token = signToken({ purchaseId, customerId: customer.id, bookId }, null);

    const { error: purchErr } = await supabase.from('Purchase').insert({
      id: purchaseId,
      customerId: customer.id,
      bookId,
      token,
      maxOpens: 999999,
      openCount: 0,
      isRevoked: false,
      createdAt: new Date().toISOString(),
    });

    if (purchErr) throw purchErr;

    // ── 5. Generate reader URL ────────────────────────────────────────────────
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    const readerUrl = `${baseUrl}/api/read/viewer?token=${token}`;

    // ── 6. Send delivery email ────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const name = customerName || 'Customer';
      console.log(`[Razorpay] Sending delivery email to ${customerEmail}`);
      await resend.emails.send({
        from: 'VihaanFlow <delivery@resend.dev>',
        to: customerEmail,
        subject: `🎉 Your purchase: ${book.title} — Access Inside`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; border-radius: 16px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">VihaanFlow</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Digital Products Delivery</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 32px;">
              <h2 style="font-size: 22px; margin: 0 0 8px; color: #f59e0b;">Thank you, ${name}! 🎉</h2>
              <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
                Your payment was successful and your ebook is ready to read. This is a private, secure copy watermarked just for you.
              </p>

              <!-- Order Summary Box -->
              <div style="background: #1c1c1e; border: 1px solid #2d2d2d; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #71717a;">Order Details</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="margin: 0; font-weight: 700; font-size: 16px; color: #ffffff;">${book.title}</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #71717a;">Digital Ebook</p>
                  </div>
                  <p style="margin: 0; font-size: 18px; font-weight: 800; color: #f59e0b;">✓ Paid</p>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${readerUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 8px 32px rgba(245, 158, 11, 0.4);">
                  📖 Read Your Ebook Now
                </a>
              </div>

              <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong style="color: #a1a1aa;">🔒 Security Notice:</strong> This is a personal, non-transferable link. Your email is watermarked on every page. Please do not share this link with others.
              </p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #2d2d2d; padding: 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                © ${new Date().getFullYear()} VihaanFlow. Questions? Reply to this email.
              </p>
            </div>

          </div>
        `,
      });
      console.log(`[Razorpay] Delivery email sent to ${customerEmail}`);
    }

    return res.json({
      success: true,
      message: 'Payment verified and ebook delivery initiated',
      purchaseId,
      readerUrl,
    });
  } catch (err) {
    console.error('[POST /api/razorpay/verify] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
