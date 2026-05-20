import { Pool } from 'pg';

export interface Sale {
  id: string;
  customer_id: string;
  sale_date: Date;
  description: string | null;
  total_amount: string;
  notes: string | null;
  created_at: Date;
}

export interface NewSale {
  customerId: string;
  description: string;
  amount: number;
}

export async function createSale(db: Pool, data: NewSale): Promise<Sale> {
  const result = await db.query<Sale>(
    `INSERT INTO sales (customer_id, description, total_amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.customerId, data.description, data.amount]
  );
  return result.rows[0];
}

export async function getSaleHistory(db: Pool, customerId: string): Promise<Sale[]> {
  const result = await db.query<Sale>(
    `SELECT id, customer_id, sale_date, description, total_amount, notes, created_at
     FROM sales
     WHERE customer_id = $1
     ORDER BY sale_date DESC
     LIMIT 10`,
    [customerId]
  );
  return result.rows;
}

export async function getAllCustomerSales(db: Pool, customerId: string): Promise<Sale[]> {
  const result = await db.query<Sale>(
    `SELECT id, customer_id, sale_date, description, total_amount, notes, created_at
     FROM sales
     WHERE customer_id = $1
     ORDER BY sale_date DESC, created_at DESC`,
    [customerId]
  );
  return result.rows;
}
