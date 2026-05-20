-- Add optional segmentation fields to customers
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS zone             TEXT,
  ADD COLUMN IF NOT EXISTS customer_type   TEXT CHECK (customer_type IN ('mayorista','confeccionista','retail','gobierno','otro')),
  ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS credit_limit    NUMERIC(12,2);
