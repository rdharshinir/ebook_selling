/**
 * store.js
 * Routes:
 *   GET  /api/store/books      — Public list of all store products
 *   GET  /api/store/books/:id  — Single book details
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/db');

// ─── GET /api/store/books ─────────────────────────────────────────────────────
router.get('/books', async (req, res) => {
  try {
    // Try with all store columns first
    let { data: books, error } = await supabase
      .from('Book')
      .select('id, title, description, price, coverUrl, createdAt')
      .order('createdAt', { ascending: false });

    // If store columns don't exist yet, fall back to base columns only
    if (error && error.message && error.message.includes('does not exist')) {
      console.warn('[store] Store columns missing — returning base book data. Run the SQL migration in Supabase.');
      const fallback = await supabase
        .from('Book')
        .select('id, title, createdAt')
        .order('createdAt', { ascending: false });
      
      if (fallback.error) throw fallback.error;
      books = (fallback.data || []).map(b => ({
        ...b,
        description: null,
        price: 49900,
        coverUrl: null,
      }));
      error = null;
    }

    if (error) throw error;
    return res.json({ success: true, books: books || [] });
  } catch (err) {
    console.error('[GET /api/store/books] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/store/books/:id ─────────────────────────────────────────────────
router.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: book, error } = await supabase
      .from('Book')
      .select('id, title, description, price, coverUrl, createdAt')
      .eq('id', id)
      .single();

    if (error || !book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    return res.json({ success: true, book });
  } catch (err) {
    console.error('[GET /api/store/books/:id] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
