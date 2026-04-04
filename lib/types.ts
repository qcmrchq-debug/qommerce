// Shared TypeScript interfaces for the application

export interface Invoice {
  id: number
  vendor_id: number
  client_id: number | null
  invoice_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  items: InvoiceItem[]
  subtotal: number
  tax_amount: number
  total_amount: number
  currency: string
  due_date: string | null
  invoices_status: "draft" | "pending" | "payment_pending" | "paid" | "overdue"
  payment_url: string | null
  qr_code_url: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
  receipt_generated: boolean
  workflow_status: string | null
  paid_at: string | null
  vendors?: {
    name: string
    email: string
    phone: string | null
    country: string
  }
}

export interface InvoiceItem {
  name: string
  description?: string
  quantity: number
  price: number
  amount?: number
  product_id?: number
}

export interface Receipt {
  id: number
  vendor_id: number
  invoice_id: number
  client_id: number | null
  receipt_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  items: InvoiceItem[]
  subtotal: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  payment_method: string
  currency: string
  payment_date: string
  created_at: string
}

export interface Client {
  id: number
  vendor_id: number | null
  name: string
  email: string
  company: string | null
  phone: string | null
  password_hash: string
  is_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  vendor_id: number
  name: string
  email: string
  phone: string | null
  password_hash: string
  country: string
  currency: string
  payfast_merchant_id?: string | null
  payfast_merchant_key?: string | null
  payfast_passphrase_enc?: string | null
  payfast_connected?: boolean | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  vendor_id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  tax_id: string | null
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}
