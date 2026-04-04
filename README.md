# Qommerce

This repository is a Next.js 16 invoice and QR payment platform that uses Supabase for Authentication and PostgreSQL database storage.

## 1. Create a new Supabase project

1. Sign in to https://app.supabase.com.
2. Create a new project.
   - Choose an organization.
   - Give it a name.
   - Set a strong database password.
   - Choose the region closest to your users.
3. Wait until the project is ready.

## 2. Get the Supabase environment variables

From the new Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL` -> Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -> Public anon key

This app currently uses only the public client key for web auth and database access.

## 3. Create the database schema

Open Supabase Dashboard > SQL Editor.

Run these SQL files in order from this repo:

1. `scripts/001_create_tables.sql`
2. `scripts/002_create_indexes.sql`
3. `scripts/003_add_vendor_id_to_clients.sql`
4. `scripts/004_add_vendor_id_to_customers.sql`
5. `scripts/005_add_invoice_number_trigger.sql`

### Why these scripts

- `001_create_tables.sql` defines the core tables used by the app: `vendors`, `clients`, `products`, `quotations`, `invoices`, `payments`, `receipts`, `purchase_orders`, `contracts`, `proposals`, `price_lists`, and related document tables.
- `002_create_indexes.sql` adds recommended indexes to improve query performance.
- `003_add_vendor_id_to_clients.sql` adds and indexes vendor scoping for `clients`.
- `004_add_vendor_id_to_customers.sql` adds and indexes vendor scoping for `customers`.
- `005_add_invoice_number_trigger.sql` creates the invoice-number trigger that generates `INV-xxxxx` values on invoice insert.

> If you are starting from a completely fresh Supabase database, run the files in the order above.

## 4. Configure local environment variables

Create a file named `.env.local` in the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Replace the values with the ones from your Supabase project's API settings.

## 5. Install dependencies

From the repo root, install packages:

```bash
npm install
```

Or if you use pnpm:

```bash
pnpm install
```

## 6. Run the app locally

```bash
npm run dev
```

Then open:

- `http://localhost:3000`

## 7. Confirm Supabase integration

The app expects Supabase configuration in these files:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `proxy.ts`

All three use:

- `process.env.NEXT_PUBLIC_SUPABASE_URL`
- `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 8. Auth and sign-up behavior

This app uses Supabase email/password auth.

- Vendors sign up via the vendor flow.
- Clients sign up via the client flow.
- The app stores vendor/customer data in Supabase tables linked by email and vendor IDs.

## 9. Optional: deploy / production

If you deploy this app, set the same environment variables in your hosting provider:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If you want server-side Supabase admin access later, create a `SUPABASE_SERVICE_ROLE_KEY` from the Supabase API settings and use it only on the server.

## 10. Troubleshooting

- If auth returns `401` or user session fails, verify `.env.local` values are correct.
- If queries fail due to missing columns or tables, make sure all `scripts/*.sql` files were executed.
- If invoice creation fails, confirm `scripts/005_add_invoice_number_trigger.sql` ran successfully.

## 11. Useful repo locations

- `app/actions/` — server actions for auth, invoices, payments, QR codes, vendors, clients.
- `app/dashboard/` — protected vendor dashboard pages.
- `app/client/` — public client-facing pages.
- `lib/supabase/` — Supabase client/server wrappers.
- `scripts/` — database schema and SQL migration scripts.

---

This README is tailored for setting up a brand-new Supabase server for this project.
