import { Pool } from 'pg';

export type PaymentMethod = 'Efectivo' | 'Nequi' | 'Transferencia' | 'Daviplata' | 'Otro';

export interface Payment {
  id: string;
  customer_id: string;
  payment_date: Date;
  amount: string;
  payment_method: PaymentMethod;
  notes: string | null;
  voided: boolean;
  created_at: Date;
}

export interface LastPayment {
  payment_date: Date;
  amount: string;
  payment_method: PaymentMethod;
}

export interface DailySummary {
  total_collected: string;
  payments_count: string;
  customers_visited: string;
  by_method: Array<{ payment_method: PaymentMethod; total: string; count: string }>;
}

export interface DailyCollection {
  day: string;
  total: string;
  count: string;
}

export interface NewPayment {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

export interface RecentPayment {
  id: string;
  payment_date: Date;
  amount: string;
  payment_method: PaymentMethod;
  notes: string | null;
  voided: boolean;
  created_at: Date;
  customer_id: string;
  customer_name: string;
  customer_company: string | null;
}

export async function createPayment(db: Pool, data: NewPayment): Promise<Payment> {
  const result = await db.query<Payment>(
    `INSERT INTO payments (customer_id, amount, payment_method, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.customerId, data.amount, data.paymentMethod, data.notes ?? null]
  );
  return result.rows[0];
}

export async function getRecentPayments(db: Pool, limit: number = 20): Promise<RecentPayment[]> {
  const result = await db.query<RecentPayment>(`
    SELECT
      p.id, p.payment_date, p.amount, p.payment_method, p.notes, p.voided, p.created_at,
      c.id      AS customer_id,
      c.name    AS customer_name,
      c.company AS customer_company
    FROM payments p
    JOIN customers c ON c.id = p.customer_id
    WHERE p.voided = false
    ORDER BY p.created_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
}

export async function getLastPayment(db: Pool, customerId: string): Promise<LastPayment | null> {
  const result = await db.query<LastPayment>(
    `SELECT payment_date, amount, payment_method
     FROM payments
     WHERE customer_id = $1 AND voided = false
     ORDER BY created_at DESC
     LIMIT 1`,
    [customerId]
  );
  return result.rows[0] ?? null;
}

export async function getDailySummary(db: Pool, date?: string): Promise<DailySummary> {
  const params = date ? [date] : [];
  const dateFilter = date ? 'payment_date = $1' : 'payment_date = CURRENT_DATE';

  const [totals, byMethod] = await Promise.all([
    db.query(
      `SELECT
         COALESCE(SUM(amount), 0)        AS total_collected,
         COUNT(*)                         AS payments_count,
         COUNT(DISTINCT customer_id)      AS customers_visited
       FROM payments
       WHERE ${dateFilter} AND voided = false`,
      params
    ),
    db.query(
      `SELECT payment_method, SUM(amount) AS total, COUNT(*) AS count
       FROM payments
       WHERE ${dateFilter} AND voided = false
       GROUP BY payment_method
       ORDER BY total DESC`,
      params
    ),
  ]);

  return {
    total_collected: totals.rows[0].total_collected,
    payments_count: totals.rows[0].payments_count,
    customers_visited: totals.rows[0].customers_visited,
    by_method: byMethod.rows,
  };
}

// Activity report over the last N days (1 = today only, 7 = last 7 days, etc).
// Same shape as DailySummary so charts and KPIs can consume either.
export async function getActivityReport(db: Pool, days: number = 1): Promise<DailySummary> {
  const dateFilter = 'payment_date > CURRENT_DATE - $1::int';

  const [totals, byMethod] = await Promise.all([
    db.query(
      `SELECT
         COALESCE(SUM(amount), 0)    AS total_collected,
         COUNT(*)                     AS payments_count,
         COUNT(DISTINCT customer_id)  AS customers_visited
       FROM payments
       WHERE ${dateFilter} AND voided = false`,
      [days]
    ),
    db.query(
      `SELECT payment_method, SUM(amount) AS total, COUNT(*) AS count
       FROM payments
       WHERE ${dateFilter} AND voided = false
       GROUP BY payment_method
       ORDER BY total DESC`,
      [days]
    ),
  ]);

  return {
    total_collected:   totals.rows[0].total_collected,
    payments_count:    totals.rows[0].payments_count,
    customers_visited: totals.rows[0].customers_visited,
    by_method:         byMethod.rows,
  };
}

export async function getCollectionTrend(db: Pool, days: number = 30): Promise<DailyCollection[]> {
  const result = await db.query<DailyCollection>(`
    WITH series AS (
      SELECT generate_series(CURRENT_DATE - $1::int + 1, CURRENT_DATE, INTERVAL '1 day')::date AS day
    ),
    daily AS (
      SELECT payment_date AS day, SUM(amount) AS total, COUNT(*) AS count
      FROM payments
      WHERE voided = false AND payment_date > CURRENT_DATE - $1::int
      GROUP BY payment_date
    )
    SELECT
      to_char(s.day, 'YYYY-MM-DD')      AS day,
      COALESCE(d.total, 0)::text         AS total,
      COALESCE(d.count, 0)::text         AS count
    FROM series s
    LEFT JOIN daily d ON d.day = s.day
    ORDER BY s.day
  `, [days]);
  return result.rows;
}

export interface CustomerPayment {
  id: string;
  payment_date: Date;
  amount: string;
  payment_method: PaymentMethod;
  notes: string | null;
  voided: boolean;
}

export async function getCustomerPayments(db: Pool, customerId: string): Promise<CustomerPayment[]> {
  const result = await db.query<CustomerPayment>(
    `SELECT id, payment_date, amount, payment_method, notes, voided
     FROM payments
     WHERE customer_id = $1
     ORDER BY payment_date DESC, created_at DESC`,
    [customerId]
  );
  return result.rows;
}

export async function voidPayment(db: Pool, paymentId: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE payments
     SET voided = true, voided_at = now()
     WHERE id = $1 AND voided = false`,
    [paymentId]
  );
  return (result.rowCount ?? 0) > 0;
}
