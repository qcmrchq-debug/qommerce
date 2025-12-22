-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  session_token TEXT,
  session_expires_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  phone TEXT,
  country TEXT NOT NULL DEFAULT 'ZA',
  currency TEXT NOT NULL DEFAULT 'ZAR',
  banking_details JSONB,
  tax_enabled BOOLEAN NOT NULL DEFAULT false,
  tax_rate DOUBLE PRECISION DEFAULT 0.15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_code TEXT,
  verification_code_expires_at TIMESTAMP WITH TIME ZONE,
  verification_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  image_url TEXT,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  doc_name TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  category TEXT NOT NULL,
  content JSONB NOT NULL,
  styles JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  quotation_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  valid_until DATE,
  quotations_status TEXT NOT NULL DEFAULT 'draft',
  terms TEXT,
  notes TEXT,
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workflow_status TEXT DEFAULT 'active',
  converted_to_invoice_id BIGINT
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  converted_from_quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  due_date DATE,
  invoices_status TEXT NOT NULL DEFAULT 'pending',
  payment_url TEXT,
  qr_code_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_generated BOOLEAN NOT NULL DEFAULT false,
  workflow_status TEXT DEFAULT 'active',
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key to quotations after invoices is created
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_invoice 
  FOREIGN KEY (converted_to_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Create cart_sessions table
CREATE TABLE IF NOT EXISTS cart_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT REFERENCES invoices(id) ON DELETE SET NULL,
  cart_session_id BIGINT REFERENCES cart_sessions(id) ON DELETE SET NULL,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  processor TEXT NOT NULL,
  processor_payment_id TEXT,
  processor_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  invoice_id BIGINT REFERENCES invoices(id) ON DELETE SET NULL,
  payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_amount DOUBLE PRECISION NOT NULL,
  amount_paid DOUBLE PRECISION NOT NULL,
  payment_method TEXT,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workflow_linked BOOLEAN NOT NULL DEFAULT false
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  po_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT NOT NULL,
  supplier_phone TEXT,
  supplier_address TEXT,
  items JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  delivery_date DATE,
  purchase_orders_status TEXT NOT NULL DEFAULT 'pending',
  terms TEXT,
  notes TEXT,
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_email TEXT NOT NULL,
  party_phone TEXT,
  party_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  value DOUBLE PRECISION,
  currency TEXT DEFAULT 'ZAR',
  contracts_status TEXT NOT NULL DEFAULT 'draft',
  terms JSONB NOT NULL,
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  proposal_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_company TEXT,
  title TEXT NOT NULL,
  executive_summary TEXT,
  scope_of_work JSONB NOT NULL,
  deliverables JSONB,
  timeline JSONB,
  pricing JSONB NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  valid_until DATE,
  proposals_status TEXT NOT NULL DEFAULT 'draft',
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  converted_to_quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price_lists table
CREATE TABLE IF NOT EXISTS price_lists (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  effective_date DATE,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_reminders table
CREATE TABLE IF NOT EXISTS payment_reminders (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  amount_due DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  sent_at TIMESTAMP WITH TIME ZONE,
  template_id BIGINT REFERENCES document_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branding_settings table
CREATE TABLE IF NOT EXISTS branding_settings (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  font_family TEXT DEFAULT 'Inter',
  header_text TEXT,
  footer_text TEXT,
  social_media JSONB,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_events table
CREATE TABLE IF NOT EXISTS workflow_events (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source_document_type TEXT NOT NULL,
  source_document_id BIGINT NOT NULL,
  target_document_type TEXT,
  target_document_id BIGINT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id BIGSERIAL PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,
  document_id BIGINT NOT NULL,
  version_number INT NOT NULL,
  document_data JSONB NOT NULL,
  change_description TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_current BOOLEAN DEFAULT false,
  UNIQUE(document_type, document_id, version_number)
);

-- Create shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  document_id BIGINT NOT NULL,
  client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
  vendor_id BIGINT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_views INT,
  view_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  tax_id VARCHAR(100),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create customer_segments table
CREATE TABLE IF NOT EXISTS customer_segments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  criteria JSONB,
  color VARCHAR(7),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create customer_segment_assignments table
CREATE TABLE IF NOT EXISTS customer_segment_assignments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  segment_id INTEGER NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, segment_id)
);

-- Create customer_communication_logs table
CREATE TABLE IF NOT EXISTS customer_communication_logs (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create customer_notes table
CREATE TABLE IF NOT EXISTS customer_notes (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
