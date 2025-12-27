-- Add vendor_id column to customers table
ALTER TABLE customers ADD COLUMN vendor_id BIGINT REFERENCES vendors(vendor_id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_customers_vendor_id ON customers(vendor_id);

-- Update existing customers to be associated with the first vendor (if any exist)
-- This is a fallback for existing data
UPDATE customers SET vendor_id = (SELECT vendor_id FROM vendors LIMIT 1) WHERE vendor_id IS NULL;