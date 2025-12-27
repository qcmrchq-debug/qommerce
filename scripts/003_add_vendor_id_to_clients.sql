-- Add vendor_id column to clients table
ALTER TABLE clients ADD COLUMN vendor_id BIGINT REFERENCES vendors(vendor_id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_clients_vendor_id ON clients(vendor_id);

-- Update existing clients to be associated with the first vendor (if any exist)
-- This is a fallback for existing data
UPDATE clients SET vendor_id = (SELECT vendor_id FROM vendors LIMIT 1) WHERE vendor_id IS NULL;