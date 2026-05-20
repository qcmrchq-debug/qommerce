# QOMMERCE Handover Documentation

**Last Updated**: May 16, 2026  
**Project**: QOMMERCE - Invoice & QR Payment Platform  
**Tech Stack**: Next.js 16, React 19, Supabase, Tailwind CSS v4, PayFast

---

## 1. Quick Start

### What is QOMMERCE?

QOMMERCE is a multi-tenant invoice and QR payment platform that enables vendors to:

- Create and manage invoices with auto-generated numbering
- Generate payment QR codes for mobile checkout
- Accept payments via PayFast (South African payment processor)
- Manage customers, quotations, receipts, and payment history
- Support a client portal where customers view and pay invoices

### Tech Stack Overview

| Component            | Technology                                            |
| -------------------- | ----------------------------------------------------- |
| **Framework**        | Next.js 16 (App Router, server components by default) |
| **Frontend**         | React 19, Tailwind CSS v4, shadcn/ui (New York style) |
| **Backend**          | Supabase PostgreSQL, server actions                   |
| **Authentication**   | Supabase Auth (email + password)                      |
| **Payments**         | PayFast (primary), Stripe (stub)                      |
| **State Management** | React hooks, Supabase client SDK                      |
| **PDF Generation**   | jsPDF                                                 |
| **Hosting**          | Currently: ngrok tunnel (development only)            |

### Current Live Deployment

- **URL**: `https://tangled-allegra-defencelessly.ngrok-free.dev`
- **Status**: Development deployment via ngrok tunneling
- **Database**: Supabase PostgreSQL at `https://zsocbazwnbnjvoaxghyl.supabase.co`
- **⚠️ Note**: NOT production-ready. Ngrok tunnel regenerates daily and is for local development only.

### Key Links

- **Supabase Dashboard**: https://app.supabase.com/ (login with credentials in team notes)
- **PayFast Merchant Dashboard**: https://www.payfast.co.za/ (test account credentials in team notes)
- **Deployed App**: https://tangled-allegra-defencelessly.ngrok-free.dev

---

## 2. Deployment & Infrastructure

### Current Environment

- **Hosting**: Local development machine with ngrok tunneling
- **Node Version**: v20+ recommended
- **Package Manager**: pnpm (not npm)
- **Build Process**: Next.js production build with TypeScript errors ignored (⚠️ flag for improvement)

### Environment Variables

Create a `.env.local` file in project root with these variables:

```env
# Supabase Configuration (Public)
NEXT_PUBLIC_SUPABASE_URL=https://zsocbazwnbnjvoaxghyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]

# PayFast Configuration (Secret)
PAYFAST_ENCRYPTION_KEY=[32-byte-hex-string]

# Application URL (Public)
NEXT_PUBLIC_APP_URL=https://tangled-allegra-defencelessly.ngrok-free.dev
```

**Current Credentials**: See team notes or Supabase dashboard  
**Storage**: `.env.local` is gitignored and never committed

### Build & Run Commands

```bash
# Development
pnpm dev              # Runs on http://localhost:3000

# Production Build
pnpm build            # Creates .next/ folder

# Production Start
pnpm start            # Runs built app

# Linting
pnpm lint             # ESLint validation
```

### Current Deployment Stack

```
Local Terminal
    ↓
pnpm dev (Next.js dev server on :3000)
    ↓
ngrok tunnel (exposes :3000 to internet)
    ↓
https://tangled-allegra-defencelessly.ngrok-free.dev
    ↓
Supabase PostgreSQL (auth + database)
    ↓
PayFast Sandbox (payment processing)
```

### Production Deployment Checklist

**⚠️ Current deployment is development-only. To move to production:**

- [ ] **1. Choose Hosting Platform**
  - Vercel (recommended for Next.js)
  - Railway.app
  - Render.com
  - AWS Amplify
  - Custom VPS + Docker

- [ ] **2. Move to Production Supabase Project**
  - Create separate Supabase project for production
  - Update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Run database migration scripts manually in new project

- [ ] **3. Configure Production PayFast Account**
  - Create production merchant account on payfast.co.za
  - Store encrypted credentials in vendor settings
  - Update `PAYFAST_ENCRYPTION_KEY` with production key

- [ ] **4. Set Production Domain**
  - Register domain and configure DNS
  - Update `NEXT_PUBLIC_APP_URL` to real domain (not ngrok)
  - Update PayFast return URLs to production domain

- [ ] **5. Enable TypeScript Error Checking**
  - Change `ignoreBuildErrors: true` to `false` in `next.config.mjs`
  - Fix all TypeScript errors before deployment

- [ ] **6. Enable Image Optimization**
  - Change `unoptimized: true` to `false` in `next.config.mjs` for better performance

- [ ] **7. Set Up CI/CD Pipeline**
  - Create `.github/workflows/` for automated testing and deployment
  - Example: GitHub Actions → Vercel deployment on push to main

- [ ] **8. Configure Database Backups**
  - Supabase: Enable automated backups in project settings
  - Set retention policy to 30+ days

- [ ] **9. Monitor & Logging**
  - Configure Vercel Analytics or similar
  - Set up error tracking (Sentry recommended)
  - Log payments and critical operations

- [ ] **10. Security Review**
  - Audit Row Level Security (RLS) policies in Supabase
  - Verify payment signature validation in PayFast webhook
  - Test vendor data isolation (users cannot access other vendors' data)

---

## 3. Database Architecture

### Database Platform

**Supabase PostgreSQL** (managed cloud database)

- URL: `https://zsocbazwnbnjvoaxghyl.supabase.co`
- Authentication: Email + password via Supabase Auth
- Real-time: Configured but minimal usage currently

### Database Schema (Migration Scripts)

All SQL migrations are in `scripts/` directory. Run manually in Supabase SQL editor:

| File                                 | Purpose        | Key Tables                                                                                    |
| ------------------------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| `001_create_tables.sql`              | Core schema    | vendors, clients, invoices, quotations, payments, receipts, products, customers, transactions |
| `002_create_indexes.sql`             | Performance    | Indexes on vendor_id, email, status, created_at                                               |
| `003_add_vendor_id_to_clients.sql`   | Multi-tenant   | Add vendor_id FK to clients table                                                             |
| `004_add_vendor_id_to_customers.sql` | Multi-tenant   | Add vendor_id FK to customers table                                                           |
| `005_add_invoice_number_trigger.sql` | Auto-numbering | Trigger generates INV-001, INV-002, etc.                                                      |

### Core Database Tables

```
vendors (multi-tenant root)
├─ id (PK)
├─ email (unique)
├─ company_name
├─ payfast_merchant_id
├─ payfast_merchant_key (encrypted)
├─ payfast_passphrase (encrypted)
└─ created_at

clients (related to vendors via email)
├─ id (PK)
├─ vendor_id (FK) [added in migration 003]
├─ email
├─ company_name
└─ created_at

invoices (core document)
├─ id (PK)
├─ vendor_id (FK) [MANDATORY FOR ISOLATION]
├─ invoice_number (auto, e.g., INV-001)
├─ items (JSONB: [{description, qty, amount}, ...])
├─ status (draft | sent | paid | completed)
├─ amount_total
├─ created_at

quotations (pre-invoice)
├─ id (PK)
├─ vendor_id (FK)
├─ quotation_number
├─ items (JSONB)
├─ status
└─ can_convert_to_invoice

payments (tracks all payments)
├─ id (PK)
├─ vendor_id (FK)
├─ invoice_id (FK)
├─ amount
├─ status (pending | completed | failed)
├─ method (payfast | stripe | cash)
├─ payfast_response (JSONB) [stores ITN data]
└─ created_at

receipts (generated post-payment)
├─ id (PK)
├─ vendor_id (FK)
├─ invoice_id (FK)
├─ payment_id (FK)
├─ receipt_number
├─ created_at

customers (vendor's clients directory)
├─ id (PK)
├─ vendor_id (FK)
├─ email
├─ name
├─ phone

products (reusable line items)
├─ id (PK)
├─ vendor_id (FK)
├─ name
├─ description
├─ price
└─ status (active | archived)
```

### Multi-Tenant Isolation Strategy

- **Every user record**: Includes `vendor_id` FK to ensure vendor ownership
- **All queries**: Must filter by `vendor_id` to prevent data leakage
- **Row Level Security (RLS)**: Configured in Supabase for additional security
- **Helper Function**: `getVendorId(supabase, user)` in server actions validates and scopes all operations

### Complex Data Storage

JSONB fields store structured data without extra schema overhead:

- **invoice.items** – Array of {description, qty, rate, amount}
- **payment.payfast_response** – Full ITN webhook payload from PayFast
- **vendor settings** – Serialized configuration (payment methods, templates, etc.)

---

## 4. Application Architecture

### Next.js 16 App Router Structure

```
app/
├─ layout.tsx                    # Root layout (theme provider, auth wrapper)
├─ page.tsx                      # Landing page (/)
├─ error.tsx                     # Error boundary
│
├─ login/
│   └─ page.tsx                  # /login (public)
│
├─ signup/
│   └─ page.tsx                  # /signup (public)
│
├─ reset-password/
│   └─ page.tsx                  # /reset-password (public)
│
├─ dashboard/                    # 🔐 VENDOR PORTAL (protected)
│   ├─ layout.tsx                # Auth check, vendor sidebar
│   ├─ page.tsx                  # Dashboard home
│   ├─ DashboardClient.tsx       # Client component for interactivity
│   ├─ PayFastBanner.tsx         # Setup PayFast credentials UI
│   ├─ customers/
│   │   └─ (pages for manage customers)
│   ├─ invoices/
│   │   └─ (pages for create/view/edit invoices)
│   ├─ qr-codes/
│   │   └─ (pages for manage QR codes)
│   ├─ receipts/
│   │   └─ (pages for view receipts)
│   └─ settings/
│       └─ (pages for vendor settings)
│
├─ client/                       # 🔐 CLIENT PORTAL (protected)
│   ├─ layout.tsx                # Auth check, client sidebar
│   ├─ page.tsx                  # Client home
│   ├─ invoices/
│   │   └─ (pages for view assigned invoices)
│   ├─ pay/
│   │   └─ [id]/page.tsx         # /client/pay/[id] (PayFast redirect)
│   ├─ payments/
│   │   └─ (pages for payment history)
│   └─ settings/
│       └─ (pages for client preferences)
│
├─ actions/                      # 💻 SERVER ACTIONS (mutations)
│   ├─ auth.ts                   # signUpVendor, signUpClient, login, logout
│   ├─ invoices.ts               # createInvoice, updateInvoice, deleteInvoice
│   ├─ payments.ts               # processPayment, markPaymentComplete
│   ├─ clients.ts                # getClients, updateClient
│   ├─ vendors.ts                # updateVendorSettings, getVendorSettings
│   ├─ qr.ts                     # generateQRCode
│   ├─ dashboard.ts              # getDashboardMetrics
│   └─ payfast.ts                # PayFast specific actions
│
└─ api/                          # 🌐 WEBHOOKS & EXTERNAL APIs
    ├─ payfast/
    │   └─ itn/route.ts          # PayFast ITN webhook listener
    ├─ stripe/
    │   └─ (stub, not implemented)
    └─ client/
        └─ (Supabase auth routes, auto-generated)
```

### Route Protection Strategy

**Server-side auth checks in layouts:**

```typescript
// app/dashboard/layout.tsx (vendor-only)
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) redirect("/login");

const vendor = await getVendorId(supabase, user); // Ensures user is vendor
if (!vendor) redirect("/login"); // Redirect if not vendor role
```

**Middleware (proxy.ts):**

- Handles session refresh and cookie management
- No explicit route guards (relies on layout checks)
- Automatically attaches user context to requests

### Authentication Flow

```
User visits /dashboard
    ↓
Layout checks: const user = await supabase.auth.getUser()
    ↓
Is user logged in?
    ├─ YES → Check vendor_id exists → Render dashboard
    ├─ NO → redirect("/login")
    └─ Invalid user type → redirect("/login")
    ↓
Supabase Auth (session from secure httpOnly cookie)
    ↓
User metadata: { user_type: "vendor" | "client" }
    ↓
Database: vendors OR clients table lookup by email
```

---

## 5. Authentication & Authorization

### Supabase Auth Setup

**User Creation Flow:**

1. User signs up with email + password
2. Supabase creates auth.users record with user_type in metadata
3. Server action creates vendor/client profile in database
4. Session cookie automatically stored (secure, httpOnly)

**Key Files:**

- [app/actions/auth.ts](app/actions/auth.ts) – `signUpVendor()`, `login()`, `logout()`
- [lib/supabase/server.ts](lib/supabase/server.ts) – Server-side client initialization
- [lib/supabase/client.ts](lib/supabase/client.ts) – Browser-side client initialization
- [proxy.ts](proxy.ts) – Middleware managing sessions

### Vendor Scoping Pattern (Critical)

**Every server action must validate vendor ownership:**

```typescript
// app/actions/invoices.ts
export async function createInvoice(formData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get vendor_id and ensure user owns this vendor
  const vendorId = await getVendorId(supabase, user);
  if (!vendorId) throw new Error("Not a vendor");

  // Query MUST include vendor_id filter
  const { data, error } = await supabase
    .from("invoices")
    .insert([{ ...formData, vendor_id: vendorId }])
    .select();

  return { data, error };
}
```

**Why this matters:**

- Prevents vendor A from accessing vendor B's invoices
- Multi-tenant isolation enforced at code level + database level (RLS)
- Every `.insert()`, `.update()`, `.delete()` must explicitly set `vendor_id`

### User Roles

| Role       | Database Table    | Portal URL     | Permissions                                                            |
| ---------- | ----------------- | -------------- | ---------------------------------------------------------------------- |
| **Vendor** | `vendors`         | `/dashboard/*` | Create invoices, manage customers, receive payments, configure PayFast |
| **Client** | `clients`         | `/client/*`    | View assigned invoices, make payments, download receipts               |
| **Admin**  | (not implemented) | N/A            | (Future: platform-wide admin functions)                                |

### Session Management

- **Type**: Cookie-based via Supabase
- **Storage**: Secure httpOnly cookie (cannot be accessed by JavaScript)
- **Refresh**: Automatic via middleware in `proxy.ts`
- **Expiry**: 1 hour (Supabase default), refreshed on each request

---

## 6. Core Features & Workflows

### Feature 1: Invoices

**Workflow:**

1. Vendor creates invoice → Items added → Invoice saved as DRAFT
2. Vendor sends invoice → Status changes to SENT
3. Client scans QR code → Redirected to `/client/pay/[id]`
4. Client pays via PayFast → Payment marked COMPLETED
5. Receipt auto-generated → Visible in both vendor & client portals

**Key Files:**

- Creation: [app/actions/invoices.ts](app/actions/invoices.ts)
- View/Edit: [app/dashboard/invoices/](app/dashboard/invoices/)
- Database: `invoices` table (vendor_id, invoice_number, items JSONB, status, amount_total)

**Invoice Numbering (Auto-generated):**

- Format: `INV-001`, `INV-002`, ..., `INV-999`
- Mechanism: PostgreSQL trigger in `005_add_invoice_number_trigger.sql`
- Scoped per vendor (each vendor has own sequence)

**Data Structure (JSONB items):**

```json
{
  "items": [
    { "description": "Web Development", "qty": 5, "rate": 100, "amount": 500 },
    { "description": "Hosting (monthly)", "qty": 1, "rate": 50, "amount": 50 }
  ],
  "total": 550,
  "tax": 82.5,
  "amount_due": 632.5
}
```

### Feature 2: QR Codes

**Purpose:** Enable mobile payment initiation without typing URLs

**Generation:**

- QR code encodes payment link: `/client/pay/[invoiceId]`
- Example: `https://tangled-allegra-defencelessly.ngrok-free.dev/client/pay/abc123`
- Generated on-demand for each invoice

**Key Files:**

- Generation: [app/actions/qr.ts](app/actions/qr.ts)
- Client display: [app/dashboard/qr-codes/](app/dashboard/qr-codes/)

**Usage:**

1. Vendor views invoice → QR code displayed
2. Vendor prints or shares QR code
3. Customer scans with phone → Browser opens payment page
4. One-click checkout via PayFast

### Feature 3: Payments (PayFast Integration)

**Payment Flow:**

```
Customer scans QR or clicks pay link
    ↓
Redirected to /client/pay/[invoiceId]
    ↓
Shows invoice details + "Pay Now" button
    ↓
Button POSTs to PayFast with MD5 signature
    ↓
Customer completes payment on PayFast
    ↓
PayFast sends ITN webhook to /api/payfast/itn
    ↓
Webhook validates MD5 signature
    ↓
If valid, marks payment as COMPLETED
    ↓
Receipt auto-generated
    ↓
Dashboard refreshes, confirms payment
```

**PayFast Integration Files:**

- [lib/payfast.ts](lib/payfast.ts) – Generate form data, validate signatures, calculate MD5
- [app/api/payfast/itn/route.ts](app/api/payfast/itn/route.ts) – Webhook listener
- [app/actions/payfast.ts](app/actions/payfast.ts) – PayFast-specific server actions

**Key Security:**

- MD5 signature validation prevents tampering
- Passphrase encrypted in vendor profile (encrypted_payfast_passphrase)
- Webhook validates Amount, Merchant ID, and Signature before confirming payment
- Never trust client-provided payment status; always verify via webhook

**Credentials Storage (Encrypted):**

```typescript
vendor record:
  payfast_merchant_id: "10000100"  // Public, unencrypted
  payfast_merchant_key: "46f1db3175061957"  // Public, unencrypted
  encrypted_payfast_passphrase: "..."  // Encrypted with PAYFAST_ENCRYPTION_KEY
```

**Sandbox vs Production:**

- Change PayFast URL in `lib/payfast.ts` based on environment
- Current: Using sandbox.payfast.co.za
- Can switch to payfast.co.za for production

### Feature 4: Receipts

**Auto-generation:**

- Created after payment marked as COMPLETED
- Idempotent (prevents duplicate receipts if webhook fires twice)
- Stores invoice + payment details

**Files:**

- Generation: [app/actions/payments.ts](app/actions/payments.ts)
- View: [app/client/receipts/](app/client/receipts/) and [app/dashboard/receipts/](app/dashboard/receipts/)
- Helper: [lib/receipt-helpers.ts](lib/receipt-helpers.ts)

**Receipt Data:**

```typescript
{
  receipt_number: "RCP-001",
  invoice_id: "...",
  payment_id: "...",
  vendor_id: "...",
  created_at: "2026-05-16T...",
  // Can generate PDF with invoice + payment proof
}
```

### Feature 5: PDF Generation

**Library:** jsPDF (client-side)

**Files:**

- Implementation: [lib/pdf.ts](lib/pdf.ts)
- Used for invoice and receipt PDFs

**Usage in Components:**

```typescript
import { generateInvoicePDF } from "@/lib/pdf";

const handleExportPDF = () => {
  generateInvoicePDF(invoiceData); // Downloads as file
};
```

**Advantages:**

- No server load (generation happens in browser)
- Instant download
- Customizable templates

---

## 7. External Integrations

### Supabase (Database + Auth)

**Endpoints:**

- URL: `https://zsocbazwnbnjvoaxghyl.supabase.co`
- Auth API: Built-in Supabase Auth
- Real-time: PostgreSQL LISTEN/NOTIFY (minimal usage)

**Client Creation (Server Side):**

```typescript
// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

export const createClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: true },
      cookies: {
        getAll: () => cookies().getAll(),
        setAll: (cookiesToSet) => { ... },
        removeAll: () => { ... }
      }
    }
  );
};
```

**Authentication:**

- User metadata stores `user_type` (set during signup)
- Session stored in secure httpOnly cookie
- Automatic session refresh via middleware

### PayFast (Payment Processing)

**What is PayFast?**

- South African payment service provider (like Stripe/Square)
- Accepts card, EFT, and wallet payments
- Merchant receives funds to bank account
- ITN (Instant Transaction Notification) for real-time updates

**Integration:**

- Credentials stored encrypted in vendor profile
- Each vendor has own merchant account
- Signature validation prevents tampering
- Sandbox: sandbox.payfast.co.za (for testing)
- Production: payfast.co.za (real money)

**Key Files:**

- [lib/payfast.ts](lib/payfast.ts) – Signature generation/validation
- [app/api/payfast/itn/route.ts](app/api/payfast/itn/route.ts) – Webhook handler
- [lib/encryption.ts](lib/encryption.ts) – Encrypt/decrypt passphrase

**Signature Validation (CRITICAL):**

```typescript
// Validate PayFast ITN webhook
const signature = md5(concatString + passphrase);
if (signature !== receivedSignature) {
  return { status: 400, error: "Signature mismatch" };
}
// Only then mark payment as complete
```

### Stripe (Stub/Future)

**Status:** Not implemented, stub files exist  
**Location:** [app/api/stripe/](app/api/stripe/)  
**Use Case:** Future expansion for developers outside South Africa

---

## 8. Key Implementation Patterns

### Pattern 1: Server Actions

All data mutations go through server actions (no REST API routes).

**Location:** `app/actions/[feature].ts`

**Signature:**

```typescript
"use server"; // Required directive

export async function actionName(formData: FormData | Object): Promise<{
  error?: string;
  success?: boolean;
  data?: any;
}> {
  const supabase = createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 2. Validate vendor ownership
  const vendorId = await getVendorId(supabase, user);
  if (!vendorId) return { error: "Not a vendor" };

  // 3. Validate input
  if (!formData.name) return { error: "Name required" };

  // 4. Perform mutation
  const { data, error } = await supabase
    .from("table")
    .insert([{ ...formData, vendor_id: vendorId }])
    .select();

  if (error) return { error: error.message };

  // 5. Return result
  return { success: true, data };
}
```

**Usage in Client Component:**

```typescript
"use client";
import { actionName } from "@/app/actions/feature";
import { useTransition } from "react";

export function Form() {
  const [, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await actionName(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Success!");
      }
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 2: Vendor-Scoped Queries

**Helper Function (in server actions):**

```typescript
export async function getVendorId(supabase, user) {
  if (!user?.email) return null;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("email", user.email)
    .single();

  return vendor?.id || null;
}
```

**Usage (always include vendor_id filter):**

```typescript
// ❌ WRONG: Fetches ALL invoices
const { data: all } = await supabase.from("invoices").select("*");

// ✅ CORRECT: Fetches only this vendor's invoices
const vendorId = await getVendorId(supabase, user);
const { data: myInvoices } = await supabase
  .from("invoices")
  .select("*")
  .eq("vendor_id", vendorId); // ESSENTIAL
```

### Pattern 3: Authentication in Layouts

**Redirect if not authenticated:**

```typescript
// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");  // Force login
  }

  return (
    <div>
      <Sidebar user={user} />
      {children}
    </div>
  );
}
```

### Pattern 4: Error Handling

**Server actions return structured errors:**

```typescript
// ✅ Consistent error pattern
return {
  error: "Specific error message",
  success: false,
};

// Display with toast
if (result.error) {
  toast.error(result.error); // User sees friendly message
} else {
  toast.success("Created successfully");
}
```

**Never expose sensitive details to client:**

```typescript
// ❌ WRONG: Leaks database error
return { error: error.message }; // "Foreign key violation on vendors..."

// ✅ CORRECT: User-friendly message
return { error: "Failed to create invoice. Please try again." };
```

### Pattern 5: Form Validation

**Use React Hook Form + Zod:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  amount: z.number().positive("Amount must be positive"),
});

export function InvoiceForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      const result = await createInvoice(data);
      // Handle result...
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 9. File Paths & Key Implementations

### Authentication

- [app/actions/auth.ts](app/actions/auth.ts) – login, logout, signUpVendor, signUpClient, resetPassword
- [lib/supabase/server.ts](lib/supabase/server.ts) – Server-side Supabase client factory
- [lib/supabase/client.ts](lib/supabase/client.ts) – Client-side Supabase client factory
- [proxy.ts](proxy.ts) – Middleware (session management, route protection)

### Invoices & Documents

- [app/actions/invoices.ts](app/actions/invoices.ts) – Create, update, delete, list invoices
- [app/dashboard/invoices/](app/dashboard/invoices/) – Vendor UI for invoice management
- [app/client/invoices/](app/client/invoices/) – Client view of invoices
- [components/invoices/InvoiceDetails.tsx](components/invoices/InvoiceDetails.tsx) – Invoice display component

### Payments & Receipts

- [app/actions/payments.ts](app/actions/payments.ts) – Mark payment complete, handle PayFast responses
- [app/api/payfast/itn/route.ts](app/api/payfast/itn/route.ts) – PayFast webhook listener
- [lib/payfast.ts](lib/payfast.ts) – PayFast integration (MD5 signatures, form generation)
- [lib/receipt-helpers.ts](lib/receipt-helpers.ts) – Receipt generation utilities

### QR & QR Management

- [app/actions/qr.ts](app/actions/qr.ts) – Generate QR code
- [app/dashboard/qr-codes/](app/dashboard/qr-codes/) – Vendor QR management UI

### Customers & Clients

- [app/actions/clients.ts](app/actions/clients.ts) – Client-related mutations
- [app/actions/vendors.ts](app/actions/vendors.ts) – Vendor profile management
- [app/dashboard/customers/](app/dashboard/customers/) – Vendor customer management
- [app/client/](app/client/) – Client portal

### Utilities & Configuration

- [lib/types.ts](lib/types.ts) – TypeScript type definitions
- [lib/utils.ts](lib/utils.ts) – Common utility functions
- [lib/encryption.ts](lib/encryption.ts) – Encrypt/decrypt PayFast passphrase
- [lib/pdf.ts](lib/pdf.ts) – PDF generation (jsPDF)
- [lib/theme-context.tsx](lib/theme-context.tsx) – Dark/light mode theme
- [components/theme-provider.tsx](components/theme-provider.tsx) – Theme provider wrapper

### Layouts & Navigation

- [app/layout.tsx](app/layout.tsx) – Root layout (ThemeProvider, global styles)
- [app/dashboard/layout.tsx](app/dashboard/layout.tsx) – Vendor dashboard layout + auth
- [app/client/layout.tsx](app/client/layout.tsx) – Client portal layout + auth
- [components/dashboard-sidebar.tsx](components/dashboard-sidebar.tsx) – Vendor nav sidebar
- [components/client-sidebar.tsx](components/client-sidebar.tsx) – Client nav sidebar
- [components/dashboard-header.tsx](components/dashboard-header.tsx) – Header with user menu

### UI Components (shadcn)

- [components/ui/](components/ui/) – Reusable shadcn/ui components
  - button, input, form, dialog, table, card, etc.
  - Import as: `import { Button } from "@/components/ui/button"`

### Database Scripts

- [scripts/001_create_tables.sql](scripts/001_create_tables.sql) – Create all tables
- [scripts/002_create_indexes.sql](scripts/002_create_indexes.sql) – Performance indexes
- [scripts/003_add_vendor_id_to_clients.sql](scripts/003_add_vendor_id_to_clients.sql) – Multi-tenant setup
- [scripts/004_add_vendor_id_to_customers.sql](scripts/004_add_vendor_id_to_customers.sql) – Multi-tenant setup
- [scripts/005_add_invoice_number_trigger.sql](scripts/005_add_invoice_number_trigger.sql) – Auto-number invoices

---

## 10. Development Workflow

### Setup for New Developers

```bash
# 1. Clone repository
git clone [repo-url]
cd qommerce

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with credentials from team notes

# 4. Start development server
pnpm dev
# Runs on http://localhost:3000

# 5. Open browser
# Visit http://localhost:3000 → see landing page
# Visit /signup → create test vendor account
```

### Common Development Tasks

#### Create a New Server Action

```bash
# 1. Create file: app/actions/feature.ts
"use server";

export async function newAction(data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const vendorId = await getVendorId(supabase, user);
  if (!vendorId) return { error: "Not a vendor" };

  // Implement logic...
  return { success: true };
}

# 2. Import in component:
import { newAction } from "@/app/actions/feature";

# 3. Use with useTransition:
const [, startTransition] = useTransition();
startTransition(async () => {
  const result = await newAction(data);
});
```

#### Add Database Migration

```bash
# 1. Create SQL file: scripts/006_migration_name.sql
ALTER TABLE table_name ADD COLUMN new_column type;

# 2. Run in Supabase SQL Editor (dashboard)
# Copy-paste SQL script, execute

# 3. Test in development client
# Verify data appears correctly
```

#### Run Linter

```bash
pnpm lint
# Checks for eslint violations
```

#### Build for Production

```bash
pnpm build
# Compiles Next.js app
# Creates .next/ folder
# Outputs any TypeScript errors (currently ignored, flag for fix)
```

### Environment Setup

- Node.js v20+
- pnpm (not npm)
- Supabase account and credentials
- PayFast sandbox account (for testing)

---

## 11. Current Limitations & Improvement Opportunities

### 🚨 Critical Issues Before Production

1. **TypeScript errors ignored** – `ignoreBuildErrors: true` in next.config.mjs should be `false`
2. **ngrok tunnel is temporary** – Daily regeneration; not suitable for production
3. **No CI/CD pipeline** – Manual deployment required; consider GitHub Actions
4. **PayFast sandbox only** – Currently testing; production requires live merchant account
5. **No automated tests** – All testing manual; consider Jest + React Testing Library

### 🔧 Architectural Improvements

1. **API routes instead of server actions** – Current approach is good, but consider REST for mobile apps later
2. **Database migrations versioning** – SQL scripts in `scripts/` not tracked by version control
3. **Error tracking** – No Sentry/error monitoring; critical for production
4. **Logging** – Minimal logging for debugging production issues
5. **Rate limiting** – No rate limiting on payments or auth endpoints

### 📱 Feature Gaps

1. **Stripe integration** – Stub exists; PayFast South Africa only
2. **Admin dashboard** – Platform-wide admin functions not implemented
3. **Email notifications** – No transactional emails (invoice sent, payment received)
4. **Multi-currency** – Only ZAR (South African Rand) supported
5. **Invoices from templates** – Manual creation only

### 🔐 Security Hardening

1. **Rate limiting** – Add to payment endpoints
2. **CSRF protection** – Verify server actions validate origin
3. **Audit logging** – Log all payment mutations for compliance
4. **Vendor IP restrictions** – Optional PayFast IP allowlist
5. **2FA for vendors** – Future security feature

---

## 12. Troubleshooting & Common Issues

### Issue: "Session expired" / Redirected to login

**Cause:** Supabase session cookie expired or invalid  
**Fix:**

1. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
2. Verify Supabase project is active (not paused)
3. Clear browser cookies and try again
4. Check middleware in `proxy.ts` is running (should see in terminal)

### Issue: PayFast payment fails with "Signature mismatch"

**Cause:** MD5 signature generation incorrect  
**Fix:**

1. Verify `PAYFAST_ENCRYPTION_KEY` matches PayFast dashboard
2. Check `payfast_merchant_id` and `payfast_merchant_key` in vendor profile are correct
3. Verify passphrase is correctly decrypted (check `lib/encryption.ts`)
4. Test signature generation locally: `console.log()` the concat string before MD5
5. Ensure using sandbox.payfast.co.za (not production)

### Issue: "Vendor ID not found"

**Cause:** User email doesn't match vendor record  
**Fix:**

1. Check vendor was created with correct email during signup
2. Verify `auth.users` table has correct email
3. Check `vendors` table has matching email
4. Try signing up again with same email
5. Check database RLS policies aren't blocking queries

### Issue: ngrok tunnel URL keeps changing

**Cause:** ngrok free tier regenerates URLs daily  
**Fix:**

1. Update `NEXT_PUBLIC_APP_URL` when URL changes
2. Update PayFast return URL in vendor settings to match new ngrok URL
3. For production, use fixed domain (not ngrok)
4. Consider ngrok paid tier (static URL) for staging

### Issue: Build fails with TypeScript errors

**Cause:** Type mismatches in code  
**Fix:**

1. Current config ignores errors (`ignoreBuildErrors: true`)
2. Fix types before production; set to `false` in `next.config.mjs`
3. Run `tsc --noEmit` to see errors
4. Check imports use correct types from `lib/types.ts`

### Issue: Invoice number not auto-incrementing

**Cause:** Database trigger not working  
**Fix:**

1. Verify `005_add_invoice_number_trigger.sql` was run in Supabase
2. Check trigger exists: SQL Editor → Triggers (should see `generate_invoice_number`)
3. Try query: `SELECT invoice_number FROM invoices ORDER BY created_at DESC LIMIT 1;`
4. Re-run migration script if missing

### Issue: Client cannot pay due to "Invoice not found"

**Cause:** Client scoped to vendor; invoice vendor_id mismatch  
**Fix:**

1. Check invoice `vendor_id` matches logged-in user's vendor
2. Check client is created with correct `vendor_id`
3. Verify invoice_id in QR code matches actual invoice in database
4. Check database has RLS policies allowing client to view vendor's invoices

### Issue: "Cannot POST to PayFast"

**Cause:** Network or endpoint misconfiguration  
**Fix:**

1. Verify `NEXT_PUBLIC_APP_URL` is correct and ngrok tunnel is active
2. Test ngrok is live: `curl https://tangled-allegra-defencelessly.ngrok-free.dev`
3. Check PayFast return URL in vendor settings matches current ngrok URL
4. Verify PayFast merchant ID and key are valid (test in PayFast dashboard)
5. Check network proxy not blocking PayFast (corporate firewalls)

---

## Support & Next Steps

**For Questions:**

1. Check corresponding file paths and code patterns in this document
2. Review server action patterns in `app/actions/` for implementation examples
3. Check Supabase docs: https://supabase.com/docs
4. Check PayFast docs: https://developers.payfast.co.za/

**For Production Deployment:**

1. Follow checklist in Section 2 (Deployment & Infrastructure)
2. Set up separate Supabase production project
3. Configure real PayFast merchant account
4. Deploy to Vercel or similar platform
5. Enable TypeScript error checking

**Key Contacts & Resources:**

- Supabase Dashboard: https://app.supabase.com/
- PayFast Merchant: https://www.payfast.co.za/
- Next.js Docs: https://nextjs.org/docs/
- GitHub Repo: [repo-url]
- Team Credentials: See team notes (not in code)

---

**Document Version:** 1.0  
**Last Reviewed:** May 16, 2026  
**Maintained By:** QOMMERCE Team

_This handover document is the single source of truth for deployment, architecture, and development for QOMMERCE. Update this document when:_

- _Adding new features or major changes_
- _Modifying deployment setup_
- _Changing authentication patterns_
- _Adding external integrations_
