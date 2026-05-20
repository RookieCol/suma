-- Write-offs: permanently remove uncollectable debt from the portfolio
CREATE TABLE IF NOT EXISTS write_offs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID        NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason         TEXT        NOT NULL,
  write_off_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_write_offs_customer ON write_offs (customer_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_date     ON write_offs (write_off_date);
