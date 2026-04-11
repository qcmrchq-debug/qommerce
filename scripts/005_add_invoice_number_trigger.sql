-- Generate vendor-scoped invoice numbers atomically using advisory locks
-- This trigger sets NEW.invoice_number for each inserted invoice when not provided

-- Create the trigger function
CREATE OR REPLACE FUNCTION set_invoice_number_for_vendor()
RETURNS TRIGGER AS $$
DECLARE
  next_num INT;
BEGIN
  -- Acquire an advisory transaction-scoped lock on the vendor id to serialize number generation
  PERFORM pg_advisory_xact_lock(NEW.vendor_id);

  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    SELECT COALESCE(MAX((split_part(invoice_number, '-', 2))::INT), 0) + 1
      INTO next_num
    FROM invoices
    WHERE vendor_id = NEW.vendor_id;

    IF next_num IS NULL OR next_num < 1 THEN
      next_num := 1;
    END IF;

    NEW.invoice_number := 'INV-' || lpad(next_num::text, 5, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'trigger_set_invoice_number_for_vendor'
  ) THEN
    CREATE TRIGGER trigger_set_invoice_number_for_vendor
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number_for_vendor();
  END IF;
END$$;
