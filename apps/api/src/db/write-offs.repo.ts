import { Pool } from 'pg';

export interface WriteOffRow {
  id: string;
  customer_id: string;
  customer_name: string;
  amount: string;
  reason: string;
  write_off_date: string;
  created_at: string;
}

export interface NewWriteOff {
  customerId: string;
  amount: number;
  reason: string;
  writeOffDate?: string;
}

export async function listWriteOffs(db: Pool, yearOnly = true): Promise<WriteOffRow[]> {
  const whereYear = yearOnly
    ? `AND EXTRACT(YEAR FROM wo.write_off_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    : '';
  const result = await db.query<WriteOffRow>(`
    SELECT
      wo.id, wo.customer_id, c.name AS customer_name,
      wo.amount::text, wo.reason,
      wo.write_off_date::text, wo.created_at::text
    FROM write_offs wo
    JOIN customers c ON c.id = wo.customer_id
    WHERE true ${whereYear}
    ORDER BY wo.write_off_date DESC
    LIMIT 100
  `);
  return result.rows;
}

export async function createWriteOff(db: Pool, data: NewWriteOff): Promise<WriteOffRow> {
  const result = await db.query<WriteOffRow>(`
    INSERT INTO write_offs (customer_id, amount, reason, write_off_date)
    VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
    RETURNING
      id, customer_id,
      (SELECT name FROM customers WHERE id = customer_id) AS customer_name,
      amount::text, reason, write_off_date::text, created_at::text
  `, [
    data.customerId,
    data.amount,
    data.reason,
    data.writeOffDate ?? null,
  ]);
  return result.rows[0];
}
