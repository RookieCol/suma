import { Pool } from 'pg';

export interface CustomerBalance {
  id: string;
  name: string;
  company: string | null;
  neighborhood: string | null;
  phone: string | null;
  zone: string | null;
  customer_type: string | null;
  payment_terms_days: number | null;
  credit_limit: string | null;
  total_debt: string;
  total_paid: string;
  pending_balance: string;
  last_payment_date?: Date | null;
  oldest_sale_date?: Date | null;
}

export interface AgingBucket {
  bucket: '0-30' | '31-60' | '61-90' | '90+';
  amount: string;
  customers: string;
}

export interface UpcomingDueRow {
  id: string;
  customer_id: string;
  customer_name: string;
  neighborhood: string | null;
  phone: string | null;
  sale_date: string;
  due_date: string;
  description: string | null;
  total_amount: string;
}

export async function getBalance(db: Pool, customerId: string): Promise<CustomerBalance | null> {
  const result = await db.query<CustomerBalance>(
    `SELECT id, name, company, neighborhood, phone, total_debt, total_paid, pending_balance
     FROM customer_balances
     WHERE id = $1`,
    [customerId]
  );
  return result.rows[0] ?? null;
}

export async function listWithDebt(db: Pool): Promise<CustomerBalance[]> {
  const result = await db.query<CustomerBalance>(`
    SELECT
      c.id, c.name, c.company, c.neighborhood, c.phone,
      c.zone, c.customer_type, c.payment_terms_days, c.credit_limit::text,
      COALESCE(s.total_debt, 0)::text                                   AS total_debt,
      COALESCE(p.total_paid, 0)::text                                   AS total_paid,
      (COALESCE(s.total_debt, 0) - COALESCE(p.total_paid, 0))::text     AS pending_balance,
      p.last_payment_date,
      s.oldest_sale_date
    FROM customers c
    LEFT JOIN (
      SELECT customer_id, SUM(total_amount) AS total_debt, MIN(sale_date) AS oldest_sale_date
      FROM sales GROUP BY customer_id
    ) s ON s.customer_id = c.id
    LEFT JOIN (
      SELECT customer_id, SUM(amount) AS total_paid, MAX(payment_date) AS last_payment_date
      FROM payments WHERE voided = false GROUP BY customer_id
    ) p ON p.customer_id = c.id
    WHERE c.active = true
      AND COALESCE(s.total_debt, 0) - COALESCE(p.total_paid, 0) > 0
    ORDER BY (COALESCE(s.total_debt, 0) - COALESCE(p.total_paid, 0)) DESC
  `);
  return result.rows;
}

export async function getAvgPaymentDays(db: Pool, customerId: string): Promise<number | null> {
  const result = await db.query<{ avg_days: string | null }>(`
    SELECT ROUND(AVG(days_to_first_payment))::text AS avg_days
    FROM (
      SELECT MIN(p.payment_date) - s.sale_date AS days_to_first_payment
      FROM sales s
      JOIN payments p ON p.customer_id = s.customer_id
        AND p.payment_date >= s.sale_date
        AND p.voided = false
      WHERE s.customer_id = $1
      GROUP BY s.id, s.sale_date
    ) sub
  `, [customerId]);
  const val = result.rows[0]?.avg_days;
  return val != null ? parseInt(val, 10) : null;
}

// FIFO aging: payments knock out the oldest sales first.
// Each sale's unpaid portion = clamp(running_total - total_paid, 0, sale_total)
export async function getAging(db: Pool): Promise<AgingBucket[]> {
  const result = await db.query<AgingBucket>(`
    WITH sales_running AS (
      SELECT
        s.customer_id,
        s.sale_date,
        s.total_amount,
        SUM(s.total_amount) OVER (PARTITION BY s.customer_id ORDER BY s.sale_date, s.id) AS running_total
      FROM sales s
      JOIN customers c ON c.id = s.customer_id
      WHERE c.active = true
    ),
    customer_paid AS (
      SELECT customer_id, COALESCE(SUM(amount), 0) AS total_paid
      FROM payments WHERE voided = false GROUP BY customer_id
    ),
    bucketed AS (
      SELECT
        sr.customer_id,
        GREATEST(0, LEAST(sr.total_amount, sr.running_total - COALESCE(cp.total_paid, 0))) AS unpaid,
        CASE
          WHEN CURRENT_DATE - sr.sale_date <= 30 THEN 1
          WHEN CURRENT_DATE - sr.sale_date <= 60 THEN 2
          WHEN CURRENT_DATE - sr.sale_date <= 90 THEN 3
          ELSE 4
        END AS bucket_idx
      FROM sales_running sr
      LEFT JOIN customer_paid cp ON cp.customer_id = sr.customer_id
    )
    SELECT
      CASE bucket_idx
        WHEN 1 THEN '0-30'
        WHEN 2 THEN '31-60'
        WHEN 3 THEN '61-90'
        ELSE '90+'
      END AS bucket,
      SUM(unpaid)::text AS amount,
      COUNT(DISTINCT customer_id)::text AS customers
    FROM bucketed
    WHERE unpaid > 0
    GROUP BY bucket_idx
    ORDER BY bucket_idx
  `);
  return result.rows;
}

export async function getUpcomingDues(db: Pool, days: number): Promise<UpcomingDueRow[]> {
  const result = await db.query<UpcomingDueRow>(`
    SELECT
      s.id,
      s.customer_id,
      c.name        AS customer_name,
      c.neighborhood,
      c.phone,
      s.sale_date::text,
      s.due_date::text,
      s.description,
      s.total_amount::text
    FROM sales s
    JOIN customers c ON c.id = s.customer_id
    WHERE c.active = true
      AND s.due_date IS NOT NULL
      AND s.due_date >= CURRENT_DATE
      AND s.due_date <= CURRENT_DATE + ($1 * INTERVAL '1 day')
    ORDER BY s.due_date ASC
    LIMIT 50
  `, [days]);
  return result.rows;
}
