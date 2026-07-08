# Memonaas — E-Commerce Website

A full-featured Pakistani fashion e-commerce platform built with Next.js 16, Prisma, PostgreSQL, and Tailwind CSS v4.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM v7 |
| Auth | NextAuth v5 (Auth.js) + Prisma Adapter |
| Storage | Cloudinary (product images) |
| Email | Resend + React Email |
| Animation | Framer Motion |
| State | Zustand |
| Error Tracking | Sentry (optional) |

---

## Project Structure

```
app/                  # Next.js App Router pages & API routes
├── admin/            # Admin dashboard (products, orders, coupons, inventory)
├── api/              # REST API handlers
├── dashboard/        # Customer account dashboard
└── (shop pages)      # Home, shop, categories, product detail, cart, checkout
components/           # Shared React components
lib/                  # Utilities, Prisma client, auth config
prisma/
├── schema.prisma     # Database schema
└── migrations/       # SQL migration history
scripts/              # DB backup / restore utilities
public/               # Static assets
```

---

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or a hosted connection string)
- A [Cloudinary](https://cloudinary.com) account
- A [Resend](https://resend.com) account

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/zaeemdevmark/Memonaas-Website.git
cd Memonaas-Website

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in every required value (see Environment Variables below)

# 4. Apply database migrations
npm run db:migrate

# 5. Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env` and supply values for every variable:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random 32-byte base64 string for NextAuth session encryption |
| `AUTH_URL` | Canonical app URL (required in production) |
| `RESEND_API_KEY` | Resend API key for sending transactional emails |
| `EMAIL_FROM` | "From" address shown to email recipients |
| `ADMIN_EMAIL_TO` | Admin inbox for order/contact notifications |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Generate `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Database Setup

```bash
# Run all pending migrations (creates tables)
npm run db:migrate

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Reset the database (deletes all data — dev only)
npm run db:reset

# Deploy migrations in production (no prompt)
npm run db:migrate:prod
```

---

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run lint         # Run ESLint
npm run build        # Production build
npm run start        # Start production server
```

---

## Build

```bash
npm run build
```

The build requires all environment variables to be set. For CI/CD, add them as secrets in your pipeline.

---

## Backup & Restore

Database backup utilities are in `scripts/`. Requires PostgreSQL client tools (`pg_dump`, `pg_restore`) in your PATH.

```bash
npm run backup:full          # Full database backup
npm run backup:incremental   # Incremental backup
npm run backup:list          # List existing backups
npm run backup:validate      # Validate backup integrity
npm run backup:restore       # Interactive restore prompt
```

---

## Admin Access

The admin dashboard is at `/admin`. Create an admin account by seeding the database or promoting an existing user via Prisma Studio (`npm run db:studio`).

---

## License

Private repository — all rights reserved.
