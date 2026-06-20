/**
 * webhook.js
 * Route: POST /api/webhooks/superprofile
 * Handles incoming payment success webhooks, generates an ebook link, and emails it.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/db');
const { signToken } = require('../services/tokenService');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/webhooks/superprofile
 * Allows ?bookId=xxx in the URL to specify which book to give access to.
 * Otherwise defaults to the first book found in the database.
 */
router.post('/superprofile', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[Webhook] Received SuperProfile webhook:', JSON.stringify(payload, null, 2));

    // 1. Extract Email and Name from payload
    // SuperProfile uses data.buyer_email, but we'll add fallbacks for flexibility
    const data = payload.data || payload;
    const email = data.buyer_email || data.email || data.customer_email;
    const name = data.buyer_name || data.name || data.customer_name || 'Customer';

    if (!email) {
      console.log('[Webhook] Missing email in payload, skipping.');
      return res.status(400).json({ success: false, error: 'No email found in webhook payload' });
    }

    // 2. Fetch or Create Customer
    let { data: customer } = await supabase
      .from('Customer')
      .select('*')
      .eq('email', email)
      .single();

    if (!customer) {
      const custId = 'cust-' + Date.now();
      const { data: newCust, error: custErr } = await supabase
        .from('Customer')
        .insert({
          id: custId,
          email: email,
          name: name,
          phone: data.phone || null,
          createdAt: new Date().toISOString()
        })
        .select()
        .single();
      
      if (custErr) throw custErr;
      customer = newCust;
      console.log(`[Webhook] Created new customer: ${email}`);
    } else {
      console.log(`[Webhook] Found existing customer: ${email}`);
    }

    // 3. Find Book
    let bookId = req.query.bookId;
    let book;
    
    if (bookId) {
      const { data: b } = await supabase.from('Book').select('*').eq('id', bookId).single();
      book = b;
    } 
    
    if (!book) {
      // Fallback: Get the most recently uploaded book
      const { data: latestBook } = await supabase
        .from('Book')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(1)
        .single();
      
      if (!latestBook) {
        throw new Error('No books found in the database to assign.');
      }
      book = latestBook;
      bookId = book.id;
    }

    // 4. Create Purchase & Token
    const purchaseId = 'purchase-' + Date.now();
    const token = signToken({ purchaseId, customerId: customer.id, bookId }, null); // No expiry by default

    const { error: purchErr } = await supabase.from('Purchase').insert({
      id: purchaseId,
      customerId: customer.id,
      bookId,
      token,
      maxOpens: 999999, // Unlimited opens
      openCount: 0,
      isRevoked: false,
      createdAt: new Date().toISOString()
    });

    if (purchErr) throw purchErr;

    // 5. Generate Reader URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    const readerUrl = `${baseUrl}/api/read/viewer?token=${token}`;

    // 6. Send Automated Email
    if (process.env.RESEND_API_KEY) {
      console.log(`[Webhook] Sending delivery email to ${email}`);
      await resend.emails.send({
        from: 'EbookVault <delivery@resend.dev>', // Update this to your verified domain later
        to: email,
        subject: `Here is your Ebook: ${book.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #333;">Thank you for your purchase, ${name}! 🎉</h2>
            <p style="color: #555; line-height: 1.6;">Your secure access to <strong>${book.title}</strong> is ready. This is a private, watermarked copy just for you.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${readerUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Read Your Ebook Now
              </a>
            </div>
            
            <p style="color: #888; font-size: 12px; margin-top: 40px; border-top: 1px solid #eaeaea; padding-top: 20px;">
              Please do not share this link. Your email is stamped on the pages as a security measure. If you have any issues, reply to this email.
            </p>
          </div>
        `
      });
      console.log(`[Webhook] Email sent successfully.`);
    } else {
      console.log(`[Webhook] Skipped sending email because RESEND_API_KEY is not set.`);
    }

    return res.status(200).json({ success: true, message: 'Purchase processed and email sent.' });

  } catch (err) {
    console.error('[Webhook Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
