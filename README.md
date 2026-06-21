# 📚 VihaanFlow / EbookVault — Full-Stack Ebook Platform

A secure, self-hosted ebook delivery platform built with a **Node.js + Express backend** and a **React + Vite frontend**. Like KDP or Gumroad but **you own everything** — admin controls access, ebooks stay private in Supabase Storage, customers buy via Razorpay, and read watermarked PDFs in-browser.

---

## ✨ Features

- 🛍️ **Digital Products Storefront** — Built-in premium ecommerce frontend for selling ebooks
- 💳 **Razorpay Integration** — Secure checkout and automated payment verification
- 📧 **Automated Email Delivery** — Sends secure download links instantly via Resend
- 🔒 **Private Supabase Storage** — PDFs never exposed publicly; all access is server-proxied
- 🔑 **JWT Access Tokens** — Unique signed token per customer per book
- 💧 **On-the-fly Watermarking** — Customer name + email stamped on every page in-memory
- 📖 **In-browser PDF.js Reader** — No download button, no right-click, mobile responsive
- 📊 **Access Control** — Per-link open count limits + expiry dates
- 🚫 **Revocation** — Admin can instantly kill any access link
- 🛠️ **Admin Dashboard** — Full dark-mode panel to manage backend access

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd "ebook sender"
npm install

# Install frontend dependencies
cd web1
npm install
cd ..
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

# Base Server Configuration
BASE_URL="http://localhost:3000"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Email Integration (Resend)
RESEND_API_KEY="re_..."

# Razorpay Integration
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

Create a `.env` in the `web1` directory for the frontend:
```bash
echo "VITE_API_URL=http://localhost:3000" > web1/.env
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

### 4. Start Servers

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd "ebook sender"
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd "ebook sender/web1"
npm run dev
```

### 5. Access the Platform

- **Storefront (Frontend):** `http://localhost:5173/digital-products`
- **Admin Panel (Backend):** `http://localhost:3000/api/admin/dashboard`

### 6. Seed Test Data (optional)

Make sure server is running, then:

```bash
npm run seed
```

This creates a test customer, a test book, and logs a ready-to-use reader URL.

---

## 📁 Project Structure

```text
/
├── prisma/                    # Database schema and seeder
├── src/                       # Node.js Express Backend
│   ├── index.js               # Express app + server entry point
│   ├── routes/
│   │   ├── admin.js           # Admin dashboard + APIs
│   │   ├── purchase.js        # Manual link generation
│   │   ├── razorpay.js        # Razorpay checkout & verification
│   │   ├── reader.js          # Secure PDF streaming
│   │   ├── store.js           # Public storefront API
│   │   ├── revoke.js          # Access revocation
│   │   └── webhook.js         # External webhooks
│   └── services/              # JWT, Supabase, Watermarking logic
├── web1/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # UI components (BookCard, Navbar)
│   │   └── pages/             # Routes (Home, Checkout, DigitalProducts, OrderSuccess)
│   ├── index.html
│   └── vite.config.ts
└── .env.example
```

---

## 🔌 API Reference

### `GET /api/store/books`
Public endpoint returning available books, prices, and descriptions for the frontend storefront.

### `POST /api/razorpay/create-order`
Creates a Razorpay order ID for a specific book checkout.

### `POST /api/razorpay/verify`
Verifies the Razorpay payment signature, creates customer access, and triggers the Resend delivery email.

### `POST /api/purchase`
(Admin) Generate an access link manually for a customer.

### `GET /api/read?token=TOKEN`
Streams a watermarked PDF inline. Validates token, checks limits, increments openCount.

### `GET /api/read/viewer?token=TOKEN`
Returns the full PDF.js HTML reader page. No download/print buttons.

### `POST /api/revoke`
(Admin) Revoke an access link permanently.

### `GET /api/admin/dashboard`
Full admin HTML panel for backend management.

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
