/**
 * admin.js
 * Routes:
 *   GET  /api/admin/dashboard    — Full HTML admin panel
 *   GET  /api/admin/customers    — JSON list of all customers
 *   GET  /api/admin/books        — JSON list of all books
 *   POST /api/admin/customer     — Create a new customer
 *   POST /api/admin/book         — Create a new book
 *   POST /api/revoke             — Revoke a purchase
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/db');

// ─── GET /api/admin/customers ────────────────────────────────────────────────
router.get('/customers', async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from('Customer')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, customers });
  } catch (err) {
    console.error('[GET /api/admin/customers] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/books ────────────────────────────────────────────────────
router.get('/books', async (req, res) => {
  try {
    const { data: books, error } = await supabase
      .from('Book')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, books });
  } catch (err) {
    console.error('[GET /api/admin/books] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/customer ────────────────────────────────────────────────
router.post('/customer', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone || !email) {
      return res.status(400).json({ success: false, error: 'name, phone, and email are required' });
    }
    const { data: customer, error } = await supabase
      .from('Customer')
      .insert({ id: 'cust-' + Date.now(), name, phone, email })
      .select()
      .single();
      
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: 'A customer with this email already exists' });
      }
      throw error;
    }
    return res.status(201).json({ success: true, customer });
  } catch (err) {
    console.error('[POST /api/admin/customer] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/book ────────────────────────────────────────────────────
router.post('/book', async (req, res) => {
  try {
    const { title, s3Key } = req.body;
    if (!title || !s3Key) {
      return res.status(400).json({ success: false, error: 'title and s3Key are required' });
    }
    const { data: book, error } = await supabase
      .from('Book')
      .insert({ id: 'book-' + Date.now(), title, s3Key })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ success: true, book });
  } catch (err) {
    console.error('[POST /api/admin/book] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/purchases ────────────────────────────────────────────────
router.get('/purchases', async (req, res) => {
  try {
    const { data: purchases, error } = await supabase
      .from('Purchase')
      .select('*, customer:Customer(*), book:Book(*)')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, purchases });
  } catch (err) {
    console.error('[GET /api/admin/purchases] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/dashboard ────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  const BASE_URL = `${req.protocol}://${req.get('host')}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EbookVault — Admin Dashboard</title>
  <meta name="description" content="Admin dashboard for managing ebook access and generating secure reader links" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #08080f;
      --bg-card: #0f0f1e;
      --bg-input: #13131f;
      --bg-hover: #1a1a2e;
      --accent: #7c3aed;
      --accent-2: #a855f7;
      --accent-light: #ede9fe;
      --success: #10b981;
      --success-bg: rgba(16,185,129,0.1);
      --danger: #ef4444;
      --danger-bg: rgba(239,68,68,0.1);
      --warning: #f59e0b;
      --text: #f1f0ff;
      --text-2: rgba(241,240,255,0.6);
      --text-3: rgba(241,240,255,0.35);
      --border: rgba(255,255,255,0.07);
      --border-focus: rgba(124,58,237,0.5);
      --radius: 12px;
      --radius-sm: 8px;
      --shadow: 0 4px 24px rgba(0,0,0,0.4);
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
    }

    /* ── Sidebar ────────────────────────────────────────────── */
    .layout { display: flex; min-height: 100vh; }

    .sidebar {
      width: 240px;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      padding: 24px 0;
      z-index: 50;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 20px 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }

    .logo-box {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .logo-text { font-weight: 800; font-size: 1.05rem; letter-spacing: -0.3px; }
    .logo-sub  { font-size: 0.7rem; color: var(--text-3); font-weight: 400; }

    .nav-section {
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .nav-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-3);
      padding: 0 8px;
      margin-bottom: 6px;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 12px;
      border-radius: var(--radius-sm);
      background: transparent;
      border: none;
      color: var(--text-2);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
      font-family: inherit;
    }

    .nav-btn:hover, .nav-btn.active {
      background: rgba(124,58,237,0.12);
      color: var(--accent-light);
    }

    .nav-btn .nav-icon { font-size: 16px; width: 20px; text-align: center; }

    .sidebar-footer {
      margin-top: auto;
      padding: 16px 20px 0;
      border-top: 1px solid var(--border);
    }

    .sidebar-footer p {
      font-size: 0.7rem;
      color: var(--text-3);
    }

    /* ── Main content ───────────────────────────────────────── */
    .main {
      margin-left: 240px;
      flex: 1;
      padding: 32px;
      min-height: 100vh;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .page-title span { color: var(--accent-light); }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .stat-icon.purple { background: rgba(124,58,237,0.15); }
    .stat-icon.green  { background: rgba(16,185,129,0.15); }
    .stat-icon.amber  { background: rgba(245,158,11,0.15); }

    .stat-val {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-2);
      margin-top: 4px;
    }

    /* ── Sections (panels) ──────────────────────────────────── */
    .section {
      display: none;
    }

    .section.active {
      display: block;
    }

    /* ── Cards ──────────────────────────────────────────────── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .card-icon {
      width: 38px;
      height: 38px;
      background: rgba(124,58,237,0.15);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
    }

    .card-subtitle {
      font-size: 0.8rem;
      color: var(--text-2);
    }

    /* ── Forms ──────────────────────────────────────────────── */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
    .form-grid.cols-1 { grid-template-columns: 1fr; }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group.span-2 { grid-column: span 2; }

    label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-2);
    }

    input, select, textarea {
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-family: inherit;
      font-size: 0.875rem;
      padding: 10px 14px;
      transition: border-color 0.15s;
      width: 100%;
      outline: none;
    }

    input:focus, select:focus, textarea:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
    }

    select option { background: var(--bg-input); }

    /* ── Buttons ────────────────────────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      border: none;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #fff;
    }

    .btn-primary:hover {
      opacity: 0.88;
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(124,58,237,0.35);
    }

    .btn-danger {
      background: var(--danger-bg);
      border: 1px solid rgba(239,68,68,0.25);
      color: var(--danger);
      font-size: 0.75rem;
      padding: 6px 12px;
    }

    .btn-danger:hover { background: rgba(239,68,68,0.2); }

    .btn-ghost {
      background: var(--bg-input);
      border: 1px solid var(--border);
      color: var(--text-2);
    }

    .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    /* ── Copy box (readerUrl output) ────────────────────────── */
    .copy-box {
      margin-top: 20px;
      padding: 20px;
      background: var(--success-bg);
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: var(--radius);
      display: none;
    }

    .copy-box.visible { display: block; }

    .copy-box-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--success);
      margin-bottom: 10px;
    }

    .copy-url-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .copy-url-input {
      flex: 1;
      font-family: monospace;
      font-size: 0.78rem;
      padding: 10px 14px;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: var(--radius-sm);
      color: #6ee7b7;
      word-break: break-all;
    }

    .copy-hint {
      margin-top: 10px;
      font-size: 0.75rem;
      color: rgba(16,185,129,0.7);
    }

    /* ── Table ──────────────────────────────────────────────── */
    .table-wrap {
      overflow-x: auto;
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    thead {
      background: var(--bg-input);
    }

    th {
      text-align: left;
      padding: 12px 16px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-3);
      white-space: nowrap;
    }

    td {
      padding: 14px 16px;
      border-top: 1px solid var(--border);
      vertical-align: middle;
    }

    tr:hover td { background: var(--bg-hover); }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .badge-green  { background: var(--success-bg); color: var(--success); border: 1px solid rgba(16,185,129,0.25); }
    .badge-red    { background: var(--danger-bg);  color: var(--danger);  border: 1px solid rgba(239,68,68,0.25); }
    .badge-amber  { background: rgba(245,158,11,0.1); color: var(--warning); border: 1px solid rgba(245,158,11,0.25); }
    .badge-gray   { background: rgba(255,255,255,0.05); color: var(--text-3); border: 1px solid var(--border); }

    /* ── Progress bar ───────────────────────────────────────── */
    .progress-wrap { display: flex; align-items: center; gap: 8px; }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,0.07);
      border-radius: 100px;
      overflow: hidden;
      min-width: 60px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 100px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      transition: width 0.3s;
    }
    .progress-text { font-size: 0.75rem; color: var(--text-2); white-space: nowrap; }

    /* ── Alerts ─────────────────────────────────────────────── */
    .alert {
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      margin-top: 12px;
      display: none;
    }
    .alert.visible { display: block; }
    .alert-success { background: var(--success-bg); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; }
    .alert-error   { background: var(--danger-bg);  border: 1px solid rgba(239,68,68,0.25);  color: #fca5a5; }

    /* ── Empty state ────────────────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--text-3);
    }

    .empty-state .icon { font-size: 36px; margin-bottom: 12px; }
    .empty-state p { font-size: 0.875rem; }

    /* ── Responsive ─────────────────────────────────────────── */
    @media (max-width: 900px) {
      .sidebar { width: 200px; }
      .main { margin-left: 200px; padding: 20px; }
      .stats-row { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .form-grid.cols-3 { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .sidebar { display: none; }
      .main { margin-left: 0; }
    }

    /* ── Spinner ────────────────────────────────────────────── */
    .spin {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>

<div class="layout">

  <!-- ── Sidebar ───────────────────────────────────────────── -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-box">📚</div>
      <div>
        <div class="logo-text">EbookVault</div>
        <div class="logo-sub">Admin Panel</div>
      </div>
    </div>

    <div class="nav-section">
      <div class="nav-label">Overview</div>
      <button class="nav-btn active" onclick="showSection('dashboard')" id="nav-dashboard">
        <span class="nav-icon">🏠</span> Dashboard
      </button>
    </div>

    <div class="nav-section">
      <div class="nav-label">Management</div>
      <button class="nav-btn" onclick="showSection('generate')" id="nav-generate">
        <span class="nav-icon">🔗</span> Generate Link
      </button>
      <button class="nav-btn" onclick="showSection('customers')" id="nav-customers">
        <span class="nav-icon">👥</span> Customers
      </button>
      <button class="nav-btn" onclick="showSection('books')" id="nav-books">
        <span class="nav-icon">📖</span> Books
      </button>
      <button class="nav-btn" onclick="showSection('purchases')" id="nav-purchases">
        <span class="nav-icon">📋</span> Purchases
      </button>
    </div>

    <div class="sidebar-footer">
      <p>EbookVault v1.0</p>
      <p style="margin-top:2px;">Secure delivery platform</p>
    </div>
  </aside>

  <!-- ── Main ──────────────────────────────────────────────── -->
  <main class="main">

    <!-- ── Dashboard Section ────────────────────────────────── -->
    <section class="section active" id="section-dashboard">
      <div class="topbar">
        <div>
          <div class="page-title">Welcome back, <span>Admin</span> 👋</div>
          <div style="font-size:0.85rem;color:var(--text-2);margin-top:4px;">Here's what's happening with your ebooks today.</div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon purple">👥</div>
          <div>
            <div class="stat-val" id="stat-customers">—</div>
            <div class="stat-label">Total Customers</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">📖</div>
          <div>
            <div class="stat-val" id="stat-books">—</div>
            <div class="stat-label">Books in Catalog</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">🔗</div>
          <div>
            <div class="stat-val" id="stat-purchases">—</div>
            <div class="stat-label">Access Links Issued</div>
          </div>
        </div>
      </div>

      <!-- Recent purchases on dashboard -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">📋</div>
          <div>
            <div class="card-title">Recent Access Links</div>
            <div class="card-subtitle">Last 5 purchase links generated</div>
          </div>
        </div>
        <div id="dashboard-recent-table">
          <div class="empty-state"><div class="icon">⏳</div><p>Loading…</p></div>
        </div>
      </div>
    </section>

    <!-- ── Generate Link Section ─────────────────────────────── -->
    <section class="section" id="section-generate">
      <div class="topbar">
        <div>
          <div class="page-title">Generate <span>Access Link</span></div>
          <div style="font-size:0.85rem;color:var(--text-2);margin-top:4px;">Create a secure reader URL to send via WhatsApp</div>
        </div>
      </div>

      <!-- Step 1: Select customer + book -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">🔗</div>
          <div>
            <div class="card-title">New Access Link</div>
            <div class="card-subtitle">Select a customer, book, and access settings</div>
          </div>
        </div>

        <form id="generate-form" onsubmit="generateLink(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="gen-customer">Customer</label>
              <select id="gen-customer" required>
                <option value="">Loading customers…</option>
              </select>
            </div>
            <div class="form-group">
              <label for="gen-book">Book</label>
              <select id="gen-book" required>
                <option value="">Loading books…</option>
              </select>
            </div>
            <div class="form-group">
              <label for="gen-expiry">Expires in (days)</label>
              <input type="number" id="gen-expiry" min="0" placeholder="Leave empty for lifetime access" />
            </div>

          </div>

          <div style="margin-top:20px;display:flex;gap:12px;align-items:center;">
            <button type="submit" class="btn btn-primary" id="gen-btn">
              ✨ Generate Link
            </button>
          </div>
        </form>

        <!-- Output copy box -->
        <div class="copy-box" id="gen-copy-box">
          <div class="copy-box-label">✅ Link Generated! Copy & paste into WhatsApp</div>
          <div class="copy-url-row">
            <div class="copy-url-input" id="gen-url-display"></div>
            <button class="btn btn-ghost" onclick="copyUrl()" id="copy-btn">📋 Copy</button>
          </div>
          <div class="copy-hint">📱 Open this URL in WhatsApp and send to your customer. They can read the ebook directly in their browser.</div>
        </div>

        <div class="alert" id="gen-alert"></div>
      </div>
    </section>

    <!-- ── Customers Section ─────────────────────────────────── -->
    <section class="section" id="section-customers">
      <div class="topbar">
        <div>
          <div class="page-title">Manage <span>Customers</span></div>
          <div style="font-size:0.85rem;color:var(--text-2);margin-top:4px;">Add new customers and view existing ones</div>
        </div>
      </div>

      <!-- Add Customer Form -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">➕</div>
          <div>
            <div class="card-title">Add New Customer</div>
            <div class="card-subtitle">Create a customer account to generate links for them</div>
          </div>
        </div>
        <form id="customer-form" onsubmit="addCustomer(event)">
          <div class="form-grid cols-3">
            <div class="form-group">
              <label for="cust-name">Full Name</label>
              <input type="text" id="cust-name" placeholder="e.g. Rahul Sharma" required />
            </div>
            <div class="form-group">
              <label for="cust-phone">Phone (with country code)</label>
              <input type="text" id="cust-phone" placeholder="e.g. 919999999999" required />
            </div>
            <div class="form-group">
              <label for="cust-email">Email</label>
              <input type="email" id="cust-email" placeholder="e.g. rahul@example.com" required />
            </div>
          </div>
          <div style="margin-top:16px;">
            <button type="submit" class="btn btn-primary">➕ Add Customer</button>
          </div>
        </form>
        <div class="alert" id="cust-alert"></div>
      </div>

      <!-- Customers Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">👥</div>
          <div>
            <div class="card-title">All Customers</div>
            <div class="card-subtitle">All registered customers in the system</div>
          </div>
        </div>
        <div id="customers-table-wrap">
          <div class="empty-state"><div class="icon">⏳</div><p>Loading…</p></div>
        </div>
      </div>
    </section>

    <!-- ── Books Section ─────────────────────────────────────── -->
    <section class="section" id="section-books">
      <div class="topbar">
        <div>
          <div class="page-title">Manage <span>Books</span></div>
          <div style="font-size:0.85rem;color:var(--text-2);margin-top:4px;">Add books to the catalog using their S3 key</div>
        </div>
      </div>

      <!-- Add Book Form -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">📖</div>
          <div>
            <div class="card-title">Add New Book</div>
            <div class="card-subtitle">Enter the S3 object key of the PDF file (e.g. books/mybook.pdf)</div>
          </div>
        </div>
        <form id="book-form" onsubmit="addBook(event)">
          <div class="form-grid">
            <div class="form-group">
              <label for="book-title">Book Title</label>
              <input type="text" id="book-title" placeholder="e.g. The Startup Playbook" required />
            </div>
            <div class="form-group">
              <label for="book-s3key">S3 Key (private bucket object path)</label>
              <input type="text" id="book-s3key" placeholder="e.g. books/startup-playbook.pdf" required />
            </div>
          </div>
          <div style="margin-top:16px;">
            <button type="submit" class="btn btn-primary">📖 Add Book</button>
          </div>
        </form>
        <div class="alert" id="book-alert"></div>
      </div>

      <!-- Books Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-icon">📚</div>
          <div>
            <div class="card-title">All Books</div>
            <div class="card-subtitle">Books currently in the catalog</div>
          </div>
        </div>
        <div id="books-table-wrap">
          <div class="empty-state"><div class="icon">⏳</div><p>Loading…</p></div>
        </div>
      </div>
    </section>

    <!-- ── Purchases Section ─────────────────────────────────── -->
    <section class="section" id="section-purchases">
      <div class="topbar">
        <div>
          <div class="page-title">All <span>Access Links</span></div>
          <div style="font-size:0.85rem;color:var(--text-2);margin-top:4px;">View, monitor and revoke purchase access links</div>
        </div>
        <button class="btn btn-ghost" onclick="loadPurchases()" style="gap:6px;">🔄 Refresh</button>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div id="purchases-table-wrap">
          <div class="empty-state" style="padding:48px;"><div class="icon">⏳</div><p>Loading…</p></div>
        </div>
      </div>
    </section>

  </main>
</div>

<script>
  const BASE = '';
  let currentUrl = '';

  // ── Navigation ─────────────────────────────────────────────────────────────
  function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('section-' + name).classList.add('active');
    document.getElementById('nav-' + name).classList.add('active');

    if (name === 'purchases') loadPurchases();
    if (name === 'customers') loadCustomersTable();
    if (name === 'books')     loadBooksTable();
    if (name === 'generate')  loadSelects();
    if (name === 'dashboard') loadDashboard();
  }

  // ── API helpers ────────────────────────────────────────────────────────────
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    return res.json();
  }

  // ── Load dashboard stats ───────────────────────────────────────────────────
  async function loadDashboard() {
    try {
      const [custData, bookData, purchData] = await Promise.all([
        apiFetch(BASE + '/api/admin/customers'),
        apiFetch(BASE + '/api/admin/books'),
        apiFetch(BASE + '/api/admin/purchases'),
      ]);
      document.getElementById('stat-customers').textContent = custData.customers?.length ?? 0;
      document.getElementById('stat-books').textContent = bookData.books?.length ?? 0;
      document.getElementById('stat-purchases').textContent = purchData.purchases?.length ?? 0;

      // Recent 5
      const recent = (purchData.purchases || []).slice(0, 5);
      renderRecentTable(recent);
    } catch (e) {
      console.error(e);
    }
  }

  function renderRecentTable(purchases) {
    const wrap = document.getElementById('dashboard-recent-table');
    if (!purchases.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No purchases yet. Generate your first link!</p></div>';
      return;
    }
    wrap.innerHTML = \`
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Book</th>
              <th>Opens</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            \${purchases.map(p => \`
              <tr>
                <td>
                  <div style="font-weight:500;">\${p.customer?.name || '—'}</div>
                  <div style="font-size:0.75rem;color:var(--text-3);">\${p.customer?.email || ''}</div>
                </td>
                <td>\${p.book?.title || '—'}</td>
                <td>
                  <div class="progress-wrap">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width:\${Math.min(100, (p.openCount/p.maxOpens)*100)}%"></div>
                    </div>
                    <span class="progress-text">\${p.openCount}/\${p.maxOpens}</span>
                  </div>
                </td>
                <td>\${getStatusBadge(p)}</td>
                <td style="color:var(--text-2);font-size:0.8rem;">\${new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      </div>
    \`;
  }

  function getStatusBadge(p) {
    if (p.isRevoked)
      return '<span class="badge badge-red">Revoked</span>';
    if (p.expiresAt && new Date() > new Date(p.expiresAt))
      return '<span class="badge badge-gray">Expired</span>';
    if (p.openCount >= p.maxOpens)
      return '<span class="badge badge-amber">Limit Reached</span>';
    return '<span class="badge badge-green">Active</span>';
  }

  // ── Load selects for generate form ────────────────────────────────────────
  async function loadSelects() {
    try {
      const [custData, bookData] = await Promise.all([
        apiFetch(BASE + '/api/admin/customers'),
        apiFetch(BASE + '/api/admin/books'),
      ]);

      const custSel = document.getElementById('gen-customer');
      custSel.innerHTML = '<option value="">— Select Customer —</option>' +
        (custData.customers || []).map(c =>
          \`<option value="\${c.id}">\${c.name} (\${c.email})</option>\`
        ).join('');

      const bookSel = document.getElementById('gen-book');
      bookSel.innerHTML = '<option value="">— Select Book —</option>' +
        (bookData.books || []).map(b =>
          \`<option value="\${b.id}">\${b.title}</option>\`
        ).join('');
    } catch (e) {
      console.error('Failed to load selects:', e);
    }
  }

  // ── Generate link ──────────────────────────────────────────────────────────
  async function generateLink(e) {
    e.preventDefault();
    const btn = document.getElementById('gen-btn');
    const alert = document.getElementById('gen-alert');
    const copyBox = document.getElementById('gen-copy-box');

    const customerId = document.getElementById('gen-customer').value;
    const bookId     = document.getElementById('gen-book').value;
    const expiresRaw = document.getElementById('gen-expiry').value;
    const expiresInDays = expiresRaw ? parseInt(expiresRaw) : null;

    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span> Generating…';
    hideAlert(alert);
    copyBox.classList.remove('visible');

    try {
      const data = await apiFetch(BASE + '/api/purchase', {
        method: 'POST',
        body: JSON.stringify({ customerId, bookId, expiresInDays }),
      });

      if (!data.success) throw new Error(data.error || 'Unknown error');

      currentUrl = data.readerUrl;
      document.getElementById('gen-url-display').textContent = data.readerUrl;
      copyBox.classList.add('visible');
    } catch (err) {
      showAlert(alert, '❌ ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '✨ Generate Link';
    }
  }

  function copyUrl() {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = currentUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      const btn = document.getElementById('copy-btn');
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    });
  }

  // ── Add customer ───────────────────────────────────────────────────────────
  async function addCustomer(e) {
    e.preventDefault();
    const alert = document.getElementById('cust-alert');
    hideAlert(alert);

    const name  = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const email = document.getElementById('cust-email').value.trim();

    try {
      const data = await apiFetch(BASE + '/api/admin/customer', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email }),
      });
      if (!data.success) throw new Error(data.error);
      showAlert(alert, \`✅ Customer "\${data.customer.name}" added successfully!\`, 'success');
      document.getElementById('customer-form').reset();
      loadCustomersTable();
    } catch (err) {
      showAlert(alert, '❌ ' + err.message, 'error');
    }
  }

  // ── Add book ───────────────────────────────────────────────────────────────
  async function addBook(e) {
    e.preventDefault();
    const alert = document.getElementById('book-alert');
    hideAlert(alert);

    const title = document.getElementById('book-title').value.trim();
    const s3Key = document.getElementById('book-s3key').value.trim();

    try {
      const data = await apiFetch(BASE + '/api/admin/book', {
        method: 'POST',
        body: JSON.stringify({ title, s3Key }),
      });
      if (!data.success) throw new Error(data.error);
      showAlert(alert, \`✅ Book "\${data.book.title}" added successfully!\`, 'success');
      document.getElementById('book-form').reset();
      loadBooksTable();
    } catch (err) {
      showAlert(alert, '❌ ' + err.message, 'error');
    }
  }

  // ── Load customers table ───────────────────────────────────────────────────
  async function loadCustomersTable() {
    const wrap = document.getElementById('customers-table-wrap');
    try {
      const data = await apiFetch(BASE + '/api/admin/customers');
      const customers = data.customers || [];
      if (!customers.length) {
        wrap.innerHTML = '<div class="empty-state"><div class="icon">👤</div><p>No customers yet. Add your first customer above.</p></div>';
        return;
      }
      wrap.innerHTML = \`
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              \${customers.map(c => \`
                <tr>
                  <td style="font-weight:500;">\${c.name}</td>
                  <td style="color:var(--text-2);">\${c.email}</td>
                  <td style="color:var(--text-2);font-family:monospace;">\${c.phone}</td>
                  <td style="color:var(--text-3);font-size:0.8rem;">\${new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      \`;
    } catch (e) {
      wrap.innerHTML = '<div class="empty-state"><p>Failed to load customers.</p></div>';
    }
  }

  // ── Load books table ───────────────────────────────────────────────────────
  async function loadBooksTable() {
    const wrap = document.getElementById('books-table-wrap');
    try {
      const data = await apiFetch(BASE + '/api/admin/books');
      const books = data.books || [];
      if (!books.length) {
        wrap.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>No books in catalog yet.</p></div>';
        return;
      }
      wrap.innerHTML = \`
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>S3 Key</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              \${books.map(b => \`
                <tr>
                  <td style="font-weight:500;">\${b.title}</td>
                  <td style="font-family:monospace;font-size:0.8rem;color:var(--text-2);">\${b.s3Key}</td>
                  <td style="color:var(--text-3);font-size:0.8rem;">\${new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      \`;
    } catch (e) {
      wrap.innerHTML = '<div class="empty-state"><p>Failed to load books.</p></div>';
    }
  }

  // ── Load purchases table ───────────────────────────────────────────────────
  async function loadPurchases() {
    const wrap = document.getElementById('purchases-table-wrap');
    wrap.innerHTML = '<div class="empty-state" style="padding:48px;"><div class="icon">⏳</div><p>Loading…</p></div>';
    try {
      const data = await apiFetch(BASE + '/api/admin/purchases');
      const purchases = data.purchases || [];
      if (!purchases.length) {
        wrap.innerHTML = '<div class="empty-state" style="padding:48px;"><div class="icon">📭</div><p>No purchases yet.</p></div>';
        return;
      }
      wrap.innerHTML = \`
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Book</th>
              <th>Opens</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            \${purchases.map(p => \`
              <tr id="row-\${p.id}">
                <td>
                  <div style="font-weight:500;">\${p.customer?.name || '—'}</div>
                  <div style="font-size:0.75rem;color:var(--text-3);">\${p.customer?.email || ''}</div>
                </td>
                <td style="font-weight:500;">\${p.book?.title || '—'}</td>
                <td>
                  <div class="progress-wrap">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width:\${Math.min(100, (p.openCount/p.maxOpens)*100)}%"></div>
                    </div>
                    <span class="progress-text">\${p.openCount}/\${p.maxOpens}</span>
                  </div>
                </td>
                <td style="font-size:0.8rem;color:var(--text-2);">
                  \${p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : '<span style="color:var(--success);">Lifetime</span>'}
                </td>
                <td>\${getStatusBadge(p)}</td>
                <td>
                  \${!p.isRevoked ? \`<button class="btn btn-danger" onclick="revoke('\${p.id}')">🚫 Revoke</button>\` : '<span style="color:var(--text-3);font-size:0.8rem;">Revoked</span>'}
                </td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      \`;
    } catch (e) {
      wrap.innerHTML = '<div class="empty-state" style="padding:48px;"><p>Failed to load purchases.</p></div>';
    }
  }

  // ── Revoke purchase ────────────────────────────────────────────────────────
  async function revoke(purchaseId) {
    if (!confirm('Are you sure you want to revoke this access link? The customer will no longer be able to open this ebook.')) return;
    try {
      const data = await apiFetch(BASE + '/api/revoke', {
        method: 'POST',
        body: JSON.stringify({ purchaseId }),
      });
      if (!data.success) throw new Error(data.error);
      loadPurchases();
    } catch (err) {
      alert('Failed to revoke: ' + err.message);
    }
  }

  // ── Alert helpers ──────────────────────────────────────────────────────────
  function showAlert(el, msg, type) {
    el.className = 'alert visible alert-' + (type === 'error' ? 'error' : 'success');
    el.textContent = msg;
  }

  function hideAlert(el) {
    el.classList.remove('visible');
    el.textContent = '';
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  loadDashboard();
</script>

</body>
</html>`;

  res.set('Content-Type', 'text/html');
  return res.send(html);
});

module.exports = router;
