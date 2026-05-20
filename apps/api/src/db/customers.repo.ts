import { Pool } from 'pg';

export interface Customer {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  notes: string | null;
  active: boolean;
  created_at: Date;
}

export interface NewCustomer {
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
}

export async function searchByName(db: Pool, query: string): Promise<Customer[]> {
  const result = await db.query<Customer>(
    `SELECT id, name, company, phone, address, neighborhood, notes, active, created_at
     FROM customers
     WHERE active = true AND similarity(name, $1) > 0.3
     ORDER BY similarity(name, $1) DESC
     LIMIT 6`,
    [query]
  );
  return result.rows;
}

export async function findById(db: Pool, id: string): Promise<Customer | null> {
  const result = await db.query<Customer>(
    `SELECT id, name, company, phone, address, neighborhood, notes, active, created_at
     FROM customers
     WHERE id = $1 AND active = true`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createCustomer(db: Pool, data: NewCustomer): Promise<Customer> {
  const result = await db.query<Customer>(
    `INSERT INTO customers (name, company, phone, address, neighborhood)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.name, data.company ?? null, data.phone ?? null, data.address ?? null, data.neighborhood ?? null]
  );
  return result.rows[0];
}

export interface CustomerUpdate {
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  notes?: string;
}

export async function updateCustomer(db: Pool, id: string, data: CustomerUpdate): Promise<Customer | null> {
  const result = await db.query<Customer>(
    `UPDATE customers
     SET name = $1, company = $2, phone = $3, address = $4, neighborhood = $5, notes = $6
     WHERE id = $7
     RETURNING *`,
    [
      data.name,
      data.company   || null,
      data.phone     || null,
      data.address   || null,
      data.neighborhood || null,
      data.notes     || null,
      id,
    ]
  );
  return result.rows[0] ?? null;
}

export async function setCustomerActive(db: Pool, id: string, active: boolean): Promise<boolean> {
  const result = await db.query(
    `UPDATE customers SET active = $1 WHERE id = $2`,
    [active, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function listAllCustomers(db: Pool): Promise<Customer[]> {
  const result = await db.query<Customer>(
    `SELECT id, name, company, phone, address, neighborhood, notes, active, created_at
     FROM customers
     ORDER BY active DESC, name ASC`
  );
  return result.rows;
}
