# 📚 EbookVault — Self-Hosted Ebook Delivery Platform

A secure, self-hosted ebook delivery platform built with Node.js + Express. Like KDP but **you own everything** — admin controls access, ebooks stay private in Supabase Storage, and customers read watermarked PDFs in-browser.

---

## ✨ Features

- 🔒 **Private Supabase Storage** — PDFs never exposed publicly; all access is server-proxied
- 🔑 **JWT Access Tokens** — Unique signed token per customer per book
- 💧 **On-the-fly Watermarking** — Customer name + email stamped on every page in-memory
- 📖 **In-browser PDF.js Reader** — No download button, no right-click, mobile responsive
- 📊 **Access Control** — Per-link open count limits + expiry dates
- 🚫 **Revocation** — Admin can instantly kill any access link
- 🛠️ **Admin Dashboard** — Full dark-mode panel to manage everything

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd "ebook sender"
npm install
```

### 2. Configure Environment

```bash
copy .env.example .env
```

Edit `.env` and fill in your values:

```env
# Supabase PostgreSQL connection string
# (Supabase Dashboard → Settings → Database → URI)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase project URL and service role key
# (Supabase Dashboard → Settings → API)
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_STORAGE_BUCKET="ebooks"

# JWT signing secret (generate a random 32+ char string)
JWT_SECRET="your-min-32-char-secret-key"

BASE_URL="http://localhost:3000"
PORT=3000
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your database (dev mode)
npm run db:push

# Or run proper migrations
npm run db:migrate
```

### 4. Start Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

### 5. Open Admin Panel

```
http://localhost:3000/api/admin/dashboard
```

### 6. Seed Test Data (optional)

Make sure server is running, then:

```bash
npm run seed
```

This creates a test customer, a test book, and logs a ready-to-use reader URL.

---

## 📁 Project Structure

```
/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Test data seeder
├── src/
│   ├── index.js               # Express app + server
│   ├── routes/
│   │   ├── purchase.js        # POST /api/purchase
│   │   ├── reader.js          # GET /api/read, /api/read/viewer
│   │   ├── admin.js           # Admin dashboard + APIs
│   │   └── revoke.js          # POST /api/revoke
│   ├── services/
│   │   ├── tokenService.js    # JWT sign/verify
│   │   ├── storageService.js  # Supabase Storage private fetch
│   │   └── watermarkService.js # pdf-lib watermarking
│   └── middleware/
│       └── validateToken.js   # JWT middleware
├── public/                    # Static assets
├── .env.example               # Environment template
└── package.json
```

---

## 🔌 API Reference

### `POST /api/purchase`
Generate an access link for a customer.

```json
// Request
{ "customerId": "...", "bookId": "...", "expiresInDays": 30, "maxOpens": 5 }

// Response
{ "success": true, "token": "eyJ...", "readerUrl": "http://localhost:3000/api/read/viewer?token=eyJ..." }
```

### `GET /api/read?token=TOKEN`
Streams a watermarked PDF inline. Validates token, checks limits, increments openCount.

### `GET /api/read/viewer?token=TOKEN`
Returns the full PDF.js HTML reader page. No download/print buttons.

### `POST /api/revoke`
Revoke an access link permanently.
```json
{ "purchaseId": "..." }
```

### `GET /api/admin/dashboard`
Full admin HTML panel.

### `GET /api/admin/customers`
Returns JSON list of all customers.

### `GET /api/admin/books`
Returns JSON list of all books.

---

## 🧐 Supabase Setup

### PostgreSQL Database
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string → URI**
3. Copy the URI and set it as `DATABASE_URL` in your `.env`
   - Use the **Transaction pooler** URI (port `6543`) for better connection handling

### Storage Bucket
1. In your Supabase project, go to **Storage → New bucket**
2. Name it `ebooks` (or whatever you set in `SUPABASE_STORAGE_BUCKET`)
3. Set it to **Private** (do NOT enable public access)
4. Upload your PDFs into the bucket (e.g. `books/mybook.pdf`)
5. Use that path as the **S3 Key** when adding books in the admin panel

### API Keys
1. Go to **Settings → API**
2. Copy the **`service_role` secret key** (NOT the `anon` key)
3. Set it as `SUPABASE_SERVICE_ROLE_KEY` — this is your server-side private key

> **Security Note**: The service role key bypasses Row-Level Security.
> Never expose it to the browser or commit it to version control.

---

## 🔐 Security Notes

- PDFs are **never saved to disk** — watermarking happens in memory only
- S3 keys are **never exposed** to the client
- JWT is signed with `HS256` using your secret
- All reader URLs have `Cache-Control: no-store`
- Right-click and print/save shortcuts are disabled in the viewer

---

## 🛠️ Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with hot reload (Node.js watch) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run seed` | Seed test data |
