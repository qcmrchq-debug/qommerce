-- Indexes for vendors and related tables
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON cart_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_expires_at ON cart_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_vendor_id ON payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Business document indexes
CREATE INDEX IF NOT EXISTS idx_quotations_vendor_id ON quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(quotations_status);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor_id ON receipts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_id ON receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(purchase_orders_status);
CREATE INDEX IF NOT EXISTS idx_contracts_vendor_id ON contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(contracts_status);
CREATE INDEX IF NOT EXISTS idx_proposals_vendor_id ON proposals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(proposals_status);
CREATE INDEX IF NOT EXISTS idx_price_lists_vendor_id ON price_lists(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_vendor_id ON payment_reminders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_vendor_id ON document_templates(vendor_id);

-- Workflow events indexes
CREATE INDEX IF NOT EXISTS idx_workflow_events_vendor_id ON workflow_events(vendor_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_source ON workflow_events(source_document_type, source_document_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_target ON workflow_events(target_document_type, target_document_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_created_at ON workflow_events(created_at DESC);

-- Document versions indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_lookup ON document_versions(document_type, document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_current ON document_versions(document_type, document_id) WHERE is_current = true;

-- Indexes for clients and shared links
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_receipts_client_id ON receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links(token);
CREATE INDEX IF NOT EXISTS idx_shared_links_client_id ON shared_links(client_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_expires_at ON shared_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- Indexes for customers and related tables
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_customer_communication_logs_customer_id ON customer_communication_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communication_logs_created_at ON customer_communication_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_segment_assignments_customer_id ON customer_segment_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_assignments_segment_id ON customer_segment_assignments(segment_id);

-- Verification indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_verification_code ON clients(verification_code) WHERE verification_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_is_verified ON clients(is_verified);
