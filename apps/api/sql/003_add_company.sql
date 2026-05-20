-- Migration: add company field to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;

-- Recreate view to expose the new column
CREATE OR REPLACE VIEW customer_balances AS
SELECT
  c.id,
  c.name,
  c.company,
  c.neighborhood,
  c.phone,
  COALESCE(s.total_debt, 0)                              AS total_debt,
  COALESCE(p.total_paid, 0)                              AS total_paid,
  COALESCE(s.total_debt, 0) - COALESCE(p.total_paid, 0) AS pending_balance
FROM customers c
LEFT JOIN (
  SELECT customer_id, SUM(total_amount) AS total_debt
  FROM sales
  GROUP BY customer_id
) s ON s.customer_id = c.id
LEFT JOIN (
  SELECT customer_id, SUM(amount) AS total_paid
  FROM payments
  WHERE voided = false
  GROUP BY customer_id
) p ON p.customer_id = c.id
WHERE c.active = true;
