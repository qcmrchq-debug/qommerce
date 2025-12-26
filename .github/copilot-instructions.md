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

## Key Patterns
- **Authentication**: Use `createClient()` from `@/lib/supabase/server` in server components/actions, `@/lib/supabase/client` in client components
- **Server Actions**: Place in `app/actions/` for form submissions and data changes (e.g., `signUpVendor` in `auth.ts`)
- **UI Components**: Import from `@/components/ui/` (shadcn/ui), wrap client logic in `"use client"` directives
- **Database Schema**: Vendors manage products, invoices, clients; see `scripts/001_create_tables.sql` for table structures
- **Routing**: Protected dashboard routes redirect unauthenticated users via middleware in `proxy.ts`

## Developer Workflows
- **Development**: `pnpm dev` (starts Next.js dev server)
- **Build**: `pnpm build` (production build)
- **Lint**: `pnpm lint` (ESLint)
- **Database**: Run SQL scripts in `scripts/` manually in Supabase dashboard
- **Environment**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Conventions
- **Imports**: Use `@/` aliases (configured in `tsconfig.json`)
- **Forms**: React Hook Form with Zod validation (e.g., in signup/login)
- **Themes**: Dark/light mode via `next-themes` and `ThemeProvider`
- **Icons**: Lucide React icons
- **Error Handling**: Return error objects from server actions, display with Sonner toasts

## Examples
- Auth check in layouts: `const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login")`
- Sidebar navigation: Active link styling based on `usePathname()` in client component
- Database inserts: Use Supabase client methods like `supabase.from("vendors").insert({...})`