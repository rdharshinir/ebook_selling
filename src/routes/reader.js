/**
 * reader.js
 * Routes:
 *   GET /api/read?token=TOKEN           — Streams watermarked PDF
 *   GET /api/read/viewer?token=TOKEN    — Returns PDF.js reader HTML page
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../services/db');
const { verifyToken } = require('../services/tokenService');
const { fetchStorageObject } = require('../services/storageService');
const { applyWatermark } = require('../services/watermarkService');

// ─── Styled error page HTML ──────────────────────────────────────────────────
function buildErrorPage(reason, detail = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Access Denied — EbookVault</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }
    .icon {
      font-size: 64px;
      margin-bottom: 24px;
      display: block;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: #f87171;
    }
    p {
      font-size: 1rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.6;
    }
    .detail {
      margin-top: 20px;
      padding: 12px 16px;
      background: rgba(248,113,113,0.1);
      border: 1px solid rgba(248,113,113,0.2);
      border-radius: 10px;
      font-size: 0.875rem;
      color: #fca5a5;
    }
    .footer {
      margin-top: 32px;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="icon">🔒</span>
    <h1>${reason}</h1>
    <p>This ebook link is no longer accessible. Please contact support if you believe this is an error.</p>
    ${detail ? `<div class="detail">${detail}</div>` : ''}
    <div class="footer">Powered by EbookVault &bull; Secure Ebook Delivery</div>
  </div>
</body>
</html>`;
}

// ─── GET /api/read?token=TOKEN ───────────────────────────────────────────────
// Validates token, increments openCount, streams watermarked PDF inline
router.get('/', async (req, res) => {
  try {
    const { token } = req.query;

    // ── 1. Verify JWT ──────────────────────────────────────────────────────
    if (!token) {
      return res.status(403).send(buildErrorPage('Invalid Link', 'No access token was provided.'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).send(
        buildErrorPage(
          isExpired ? 'Link Expired' : 'Invalid Link',
          isExpired ? 'This access link has expired.' : 'The access token is malformed or invalid.'
        )
      );
    }

    // ── 2. Fetch purchase from DB ──────────────────────────────────────────
    const { data: purchase } = await supabase
      .from('Purchase')
      .select('*, customer:Customer(*), book:Book(*)')
      .eq('id', decoded.purchaseId)
      .single();

    if (!purchase) {
      return res.status(403).send(buildErrorPage('Invalid Link', 'Purchase record not found.'));
    }

    // ── 3. Access control checks ───────────────────────────────────────────
    if (purchase.isRevoked) {
      return res.status(403).send(buildErrorPage('Access Revoked', 'This link has been revoked by the administrator.'));
    }

    if (purchase.expiresAt && new Date() > purchase.expiresAt) {
      return res.status(403).send(buildErrorPage('Link Expired', `This link expired on ${purchase.expiresAt.toLocaleDateString()}.`));
    }

    // Access limit removed as requested. We still increment the count below for analytics.

    // ── 4. Increment open count ────────────────────────────────────────────
    await supabase
      .from('Purchase')
      .update({ openCount: purchase.openCount + 1 })
      .eq('id', purchase.id);

    // ── 5. Fetch PDF from Supabase Storage (private) ─────────────────────
    const pdfBuffer = await fetchStorageObject(purchase.book.s3Key);

    // ── 6. Apply in-memory watermark ──────────────────────────────────────
    const watermarkedPdf = await applyWatermark(pdfBuffer, {
      customerName: purchase.customer.name,
      customerEmail: purchase.customer.email,
    });

    // ── 7. Stream response (inline, no download) ──────────────────────────
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"',
      'Content-Length': watermarkedPdf.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });

    return res.send(Buffer.from(watermarkedPdf));
  } catch (err) {
    console.error('[GET /api/read] Error:', err);
    return res.status(500).send(buildErrorPage('Server Error', 'An unexpected error occurred. Please try again later.'));
  }
});

// ─── GET /api/read/viewer?token=TOKEN ───────────────────────────────────────
// Returns full HTML page with embedded PDF.js viewer
router.get('/viewer', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(403).send(buildErrorPage('Invalid Link', 'No access token was provided.'));
    }

    // Decode JWT to get customer/book info for header display
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).send(
        buildErrorPage(
          isExpired ? 'Link Expired' : 'Invalid Link',
          isExpired ? 'This access link has expired.' : 'The access token is malformed or invalid.'
        )
      );
    }

    // Fetch purchase details for header
    const { data: purchase } = await supabase
      .from('Purchase')
      .select('*, customer:Customer(*), book:Book(*)')
      .eq('id', decoded.purchaseId)
      .single();

    if (!purchase) {
      return res.status(403).send(buildErrorPage('Invalid Link', 'Purchase record not found.'));
    }

    if (purchase.isRevoked) {
      return res.status(403).send(buildErrorPage('Access Revoked', 'This link has been revoked by the administrator.'));
    }

    const customerName = purchase.customer.name;
    const bookTitle = purchase.book.title;
    const pdfSrc = `/api/read?token=${encodeURIComponent(token)}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${bookTitle} — EbookVault Reader</title>
  <meta name="description" content="Secure ebook reader for ${bookTitle}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-primary: #0d0d14;
      --bg-secondary: #13131f;
      --bg-card: rgba(255,255,255,0.04);
      --accent: #7c3aed;
      --accent-light: #a78bfa;
      --text-primary: #f1f0ff;
      --text-secondary: rgba(241,240,255,0.6);
      --border: rgba(255,255,255,0.08);
      --header-height: 64px;
    }

    html, body {
      height: 100%;
      font-family: 'Inter', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      overflow: hidden;
    }

    /* ── Header ─────────────────────────────────────────────── */
    .header {
      height: var(--header-height);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1rem;
      color: var(--accent-light);
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--accent), #a855f7);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .divider {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    .book-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 6px 14px 6px 8px;
    }

    .user-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), #ec4899);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .opens-badge {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 4px 12px;
    }

    /* ── PDF Viewer Container ──────────────────────────────── */
    .viewer-wrap {
      position: fixed;
      top: var(--header-height);
      left: 0;
      right: 0;
      bottom: 0;
      background: #1a1a2e;
    }

    #pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    /* ── Loading overlay ──────────────────────────────────── */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: #1a1a2e;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      z-index: 10;
      transition: opacity 0.5s ease;
    }

    .loading-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(124,58,237,0.2);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* ── Mobile responsive ────────────────────────────────── */
    @media (max-width: 640px) {
      .header { padding: 0 16px; }
      .book-title { max-width: 140px; font-size: 0.8rem; }
      .divider { display: none; }
      .opens-badge { display: none; }
      .user-name { font-size: 0.75rem; }
    }

    /* ── Security: disable selection/right-click feel ─────── */
    .viewer-wrap {
      user-select: none;
      -webkit-user-select: none;
    }

    /* ═══════════════════════════════════════════════════════════
       PREMIUM SECURITY OVERLAY
    ═══════════════════════════════════════════════════════════ */
    .security-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: opacity 0.2s ease;
      background: #000;
    }
    .security-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    /* animated diagonal grid */
    .so-grid {
      position: absolute;
      inset: 0;
      background-image: repeating-linear-gradient(
        -45deg,
        rgba(100,116,139,0.15) 0px,
        rgba(100,116,139,0.15) 1px,
        transparent 1px,
        transparent 28px
      );
      mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, black 100%);
      -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, black 100%);
    }

    /* large glowing blob behind the card */
    .so-blob {
      position: absolute;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle at 45% 40%,
        rgba(124,58,237,0.55) 0%,
        rgba(79,20,180,0.45) 35%,
        rgba(30,0,80,0.3) 60%,
        transparent 100%
      );
      animation: soblobPulse 8s ease-in-out infinite;
      filter: blur(2px);
    }
    @keyframes soblobPulse {
      0%,100% { transform: scale(1) rotate(0deg);   opacity: 0.8; }
      50%      { transform: scale(1.08) rotate(8deg); opacity: 1; }
    }

    /* floating orbs */
    .so-orb {
      position: absolute;
      border-radius: 50%;
      opacity: 0.25;
      animation: soFloat linear infinite;
      filter: blur(0px);
    }
    .so-orb:nth-child(1) { width:10px; height:10px; background:#a78bfa; top:15%; left:12%; animation-duration:6s; animation-delay:0s; }
    .so-orb:nth-child(2) { width:6px;  height:6px;  background:#7c3aed; top:70%; left:20%; animation-duration:8s; animation-delay:1s; }
    .so-orb:nth-child(3) { width:8px;  height:8px;  background:#c4b5fd; top:30%; left:80%; animation-duration:7s; animation-delay:2s; }
    .so-orb:nth-child(4) { width:5px;  height:5px;  background:#ddd6fe; top:80%; left:75%; animation-duration:9s; animation-delay:0.5s; }
    .so-orb:nth-child(5) { width:12px; height:12px; background:#8b5cf6; top:50%; left:5%;  animation-duration:5s; animation-delay:3s; }
    .so-orb:nth-child(6) { width:7px;  height:7px;  background:#a78bfa; top:20%; left:55%; animation-duration:10s; animation-delay:1.5s; }
    @keyframes soFloat {
      0%   { transform: translateY(0px) scale(1); opacity: 0.25; }
      50%  { transform: translateY(-22px) scale(1.2); opacity: 0.5; }
      100% { transform: translateY(0px) scale(1); opacity: 0.25; }
    }

    /* glass card */
    .so-card {
      position: relative;
      z-index: 10;
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 28px;
      padding: 56px 48px 48px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04),
        0 32px 80px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,255,255,0.08);
      animation: soCardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes soCardIn {
      from { opacity: 0; transform: translateY(32px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* lock icon ring */
    .so-icon-ring {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.15));
      border: 1px solid rgba(167,139,250,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 28px;
      font-size: 38px;
      animation: soIconPulse 3s ease-in-out infinite;
      box-shadow: 0 0 30px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    @keyframes soIconPulse {
      0%,100% { box-shadow: 0 0 30px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.08); }
      50%      { box-shadow: 0 0 50px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.08); }
    }

    .so-eyebrow {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #a78bfa;
      margin-bottom: 10px;
    }
    .so-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 12px;
    }
    .so-desc {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.45);
      line-height: 1.65;
      margin-bottom: 32px;
    }

    /* CTA button */
    .security-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 15px 34px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: #fff;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: 0.01em;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.1),
        0 8px 24px rgba(124,58,237,0.45),
        0 2px 4px rgba(0,0,0,0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      overflow: hidden;
    }
    .security-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .security-btn:hover {
      transform: translateY(-2px);
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.12),
        0 16px 40px rgba(124,58,237,0.55),
        0 4px 8px rgba(0,0,0,0.3);
    }
    .security-btn:hover::before { opacity: 1; }
    .security-btn:active { transform: translateY(0); }
    .security-btn svg { width: 20px; height: 20px; flex-shrink: 0; }

    /* status text below button */
    .security-text {
      margin-top: 20px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.3);
      line-height: 1.5;
    }

    /* bottom brand strip */
    .so-brand {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.03em;
    }
    .so-brand-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: rgba(167,139,250,0.4);
    }
  </style>
</head>
<body>

  <!-- Premium Security Overlay -->
  <div class="security-overlay" id="security-overlay">
    <!-- background layers -->
    <div class="so-grid"></div>
    <div class="so-blob"></div>
    <div class="so-orb"></div>
    <div class="so-orb"></div>
    <div class="so-orb"></div>
    <div class="so-orb"></div>
    <div class="so-orb"></div>
    <div class="so-orb"></div>

    <!-- glass card -->
    <div class="so-card">
      <div class="so-icon-ring">🔐</div>
      <div class="so-eyebrow">VihaanFlow Ebook Vault</div>
      <h1 class="so-title">Secure Reading Mode</h1>
      <p class="so-desc" id="security-overlay-desc">
        This document is protected. Full-screen mode is required to read it.
        The content will be hidden if you leave full screen.
      </p>
      <button class="security-btn" id="start-reading-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
        Start Reading in Full Screen
      </button>
      <p class="security-text" id="security-text">Your session is encrypted and watermarked.</p>
      <div class="so-brand">
        <span class="so-brand-dot"></span>
        Protected by VihaanFlow Ebook Vault
        <span class="so-brand-dot"></span>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <div class="logo">
        <div class="logo-icon">📚</div>
        <span>EbookVault</span>
      </div>
      <div class="divider"></div>
      <span class="book-title">${bookTitle}</span>
    </div>
    <div class="header-right">
      <div class="user-badge">
        <div class="user-avatar">${customerName.charAt(0).toUpperCase()}</div>
        <span class="user-name">${customerName}</span>
      </div>
    </div>
  </header>

  <!-- PDF Viewer -->
  <div class="viewer-wrap">
    <div class="loading-overlay" id="loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">Preparing your secure document…</div>
    </div>

    <!--
      We embed the PDF directly via our secured /api/read endpoint.
      Appending #toolbar=0 hides the native download/print buttons in most modern browsers.
    -->
    <iframe
      id="pdf-iframe"
      src="${pdfSrc}#toolbar=0"
      title="Secure Ebook Reader"
      onload="onIframeLoad()"
      allowfullscreen
    ></iframe>
  </div>

  <script>
    // ── Hide loading overlay once iframe loads ─────────────────────────────
    function onIframeLoad() {
      setTimeout(() => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
      }, 800);
    }

    // ── Disable right-click on the page ───────────────────────────────────
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // ── Disable keyboard shortcuts for print/save ──────────────────────────
    document.addEventListener('keydown', function(e) {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['s', 'p', 'u', 'a'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return false;
      }
    });

    // ── Try to suppress PDF.js toolbar buttons via postMessage ────────────
    // This works for same-origin PDF.js; CDN version has limited support.
    const iframe = document.getElementById('pdf-iframe');

    iframe.addEventListener('load', function() {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const style = iframeDoc.createElement('style');
          style.textContent = \`
            /* Hide download, print, open-file buttons in PDF.js toolbar */
            #download, #openFile, #print,
            #secondaryDownload, #secondaryOpenFile, #secondaryPrint,
            .toolbarButton.download, .toolbarButton.print,
            [data-l10n-id="pdfjs-download-button"],
            [data-l10n-id="pdfjs-print-button"],
            [data-l10n-id="pdfjs-open-button"],
            #toolbarViewerRight .toolbarButton:not(#scaleSelectContainer) {
              display: none !important;
            }
          \`;
          iframeDoc.head.appendChild(style);
        }
      } catch (err) {
        // Cross-origin restrictions may prevent access — acceptable
        console.info('[EbookVault] Could not inject toolbar CSS (cross-origin)');
      }
    });

    // ── Fullscreen & Anti-Screenshot Logic ────────────────────────────────
    const securityOverlay = document.getElementById('security-overlay');
    const startBtn = document.getElementById('start-reading-btn');
    const securityText = document.getElementById('security-text');

    startBtn.addEventListener('click', async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen(); // Safari
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen(); // IE11
        }
        securityOverlay.classList.add('hidden');
      } catch (err) {
        alert('Fullscreen is required to read this document. Please allow full screen prompts.');
      }
    });

    // Lock screen when exiting fullscreen
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        securityOverlay.classList.remove('hidden');
        securityText.textContent = 'You exited full screen. Click below to resume reading.';
      }
    });
    document.addEventListener('webkitfullscreenchange', () => {
      if (!document.webkitFullscreenElement) {
        securityOverlay.classList.remove('hidden');
        securityText.textContent = 'You exited full screen. Click below to resume reading.';
      }
    });

    // Blur screen on lost focus
    window.addEventListener('blur', () => {
      securityOverlay.classList.remove('hidden');
      securityText.textContent = 'Window lost focus. Click below to resume reading in full screen.';
    });

    // Intercept PrintScreen
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText('Screenshots disabled.'); } catch(e){}
        securityOverlay.classList.remove('hidden');
        securityText.textContent = 'Screenshots are disabled. Click below to resume reading.';
      }
    });
  </script>
</body>
</html>`;

    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store',
    });
    return res.send(html);
  } catch (err) {
    console.error('[GET /api/read/viewer] Error:', err);
    return res.status(500).send(buildErrorPage('Server Error', 'An unexpected error occurred.'));
  }
});

module.exports = router;
