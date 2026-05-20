-- Enable fuzzy name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Customers
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  company      TEXT,
  phone        TEXT,
  address      TEXT,
  neighborhood TEXT,
  notes        TEXT,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Credit sales (origin of debt)
CREATE TABLE sales (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  sale_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  description  TEXT,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Payments collected on route
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Efectivo','Nequi','Transferencia','Daviplata','Otro')),
  notes          TEXT,
  voided         BOOLEAN DEFAULT false,
  voided_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Balance view (NEVER compute balances in TypeScript — always read from this view)
-- Uses subqueries to avoid the cartesian product bug of a double LEFT JOIN
CREATE VIEW customer_balances AS
SELECT
  c.id,
  c.name,
  c.company,
  c.neighborhood,
  c.phone,
  COALESCE(s.total_debt, 0)                           AS total_debt,
  COALESCE(p.total_paid, 0)                           AS total_paid,
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

-- Indexes for frequent queries
CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);
CREATE INDEX idx_customers_active    ON customers (active);
CREATE INDEX idx_sales_customer      ON sales (customer_id);
CREATE INDEX idx_payments_customer   ON payments (customer_id);
CREATE INDEX idx_payments_date       ON payments (payment_date);
