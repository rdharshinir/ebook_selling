/**
 * index.js
 * Main Express application entry point.
 * Mounts all routes and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ── Route imports ─────────────────────────────────────────────────────────────
const purchaseRouter = require('./routes/purchase');
const readerRouter   = require('./routes/reader');
const adminRouter    = require('./routes/admin');
const revokeRouter   = require('./routes/revoke');
const webhookRouter  = require('./routes/webhook');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public (viewer.html, assets)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'EbookVault',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/purchase',        purchaseRouter);
app.use('/api/read',            readerRouter);
app.use('/api/admin',           adminRouter);
app.use('/api/revoke',          revokeRouter);
app.use('/api/webhooks',        webhookRouter);

// ── Root redirect to admin dashboard ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/api/admin/dashboard');
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║       📚  EbookVault Server Started       ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐 Base URL:      ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`  🔧 Admin Panel:   ${process.env.BASE_URL || `http://localhost:${PORT}`}/api/admin/dashboard`);
  console.log(`  💪 Supabase URL:  ${process.env.SUPABASE_URL || '(not set)'}`);
  console.log(`  🗄️  Storage Bucket: ${process.env.SUPABASE_STORAGE_BUCKET || 'ebooks'}`);
  console.log(`  💚 Health Check:  http://localhost:${PORT}/health`);
  console.log('');
  console.log('  Routes registered:');
  console.log('    POST /api/purchase          — Generate access link');
  console.log('    GET  /api/read?token=...    — Stream watermarked PDF');
  console.log('    GET  /api/read/viewer?token — PDF.js reader page');
  console.log('    POST /api/revoke            — Revoke access');
  console.log('    GET  /api/admin/dashboard   — Admin panel');
  console.log('    GET  /api/admin/customers   — Customers list');
  console.log('    GET  /api/admin/books       — Books list');
  console.log('');
});

module.exports = app;
