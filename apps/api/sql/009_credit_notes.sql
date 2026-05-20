-- Credit notes: reduce a customer's balance without a payment
CREATE TABLE IF NOT EXISTS credit_notes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID        NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  sale_id     UUID        REFERENCES sales(id) ON DELETE SET NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason      TEXT        NOT NULL,
  note_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  applied     BOOLEAN     NOT NULL DEFAULT false,
  applied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_customer ON credit_notes (customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_applied  ON credit_notes (applied);
