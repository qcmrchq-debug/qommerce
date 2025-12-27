# QOMMERCE - AI Coding Guidelines

## Project Overview

QOMMERCE is a Next.js 16 invoice and QR payment platform for vendors. It uses Supabase for authentication and database, with a dashboard for managing invoices, QR codes, receipts, and customers.

## Architecture

- **Framework**: Next.js 16 with App Router (server components by default)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (New York style)
- **Backend**: Supabase (auth + PostgreSQL database)
- **State Management**: React hooks, server actions for mutations
- **File Structure**:
  - `app/`: Route handlers and layouts
  - `components/`: Reusable UI components
  - `lib/`: Utilities, Supabase clients, theme context
  - `app/actions/`: Server actions for data mutations

## Database Schema & Data Flow

- **Core Entities**: Vendors manage products, invoices, quotations, receipts, payments, clients, customers
- **Relationships**: All vendor-owned records linked by `vendor_id`; invoices can convert to receipts; quotations can convert to invoices
- **JSON Storage**: Complex data (items, templates, settings) stored as JSONB in PostgreSQL
- **Document Workflow**: Quotation → Invoice → Payment → Receipt with status tracking
- **Authentication**: Supabase auth users linked to vendor/client tables via email; user metadata stores `user_type`

## Key Patterns

- **Authentication**: Use `createClient()` from `@/lib/supabase/server` in server components/actions, `@/lib/supabase/client` in client components
- **Server Actions**: Place in `app/actions/` for form submissions and data changes (e.g., `signUpVendor` in `auth.ts`)
- **Vendor ID Lookup**: Helper function `getVendorId(supabase, user)` queries vendors table by email to get `vendor_id` for scoped operations
- **Invoice Numbering**: Auto-generated as `INV-{sequential number}` padded to 3 digits (e.g., `INV-001`)
- **UI Components**: Import from `@/components/ui/` (shadcn/ui), wrap client logic in `"use client"` directives
- **Database Schema**: See `scripts/001_create_tables.sql` for table structures; run manually in Supabase dashboard
- **Routing**: Protected dashboard routes redirect unauthenticated users via middleware in `proxy.ts`
- **PDF Generation**: Uses jsPDF for document generation with stored templates

## Developer Workflows

- **Development**: `pnpm dev` (starts Next.js dev server)
- **Build**: `pnpm build` (production build with TS errors ignored)
- **Lint**: `pnpm lint` (ESLint)
- **Database**: Run SQL scripts in `scripts/` manually in Supabase dashboard
- **Environment**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Conventions

- **Imports**: Use `@/` aliases (configured in `tsconfig.json`)
- **Forms**: React Hook Form with Zod validation (e.g., in signup/login)
- **Themes**: Custom theme context with localStorage persistence and system preference detection
- **Icons**: Lucide React icons
- **Error Handling**: Return error objects from server actions, display with Sonner toasts
- **Middleware**: Session management in `lib/supabase/proxy.ts` handles auth redirects
- **Auth Checks**: Server-side auth validation in layout components using `createClient()`

## Examples

- Auth check in layouts: `const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login")`
- Sidebar navigation: Active link styling based on `usePathname()` in client component
- Database inserts: Use Supabase client methods like `supabase.from("vendors").insert({...})`
- Vendor-scoped queries: `supabase.from("invoices").select("*").eq("vendor_id", vendorId)`
- Theme toggle: Custom hook `useTheme()` with `toggleTheme()` function
