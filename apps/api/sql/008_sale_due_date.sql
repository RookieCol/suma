-- Add due_date to sales; backfill from sale_date + 30 days
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS due_date DATE;

UPDATE sales
SET due_date = sale_date + INTERVAL '30 days'
WHERE due_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_sales_due_date ON sales (due_date);
