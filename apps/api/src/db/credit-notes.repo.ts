import { Pool } from 'pg';

export interface CreditNoteRow {
  id: string;
  customer_id: string;
  customer_name: string;
  sale_id: string | null;
  amount: string;
  reason: string;
  note_date: string;
  applied: boolean;
  applied_at: string | null;
  created_at: string;
}

export interface NewCreditNote {
  customerId: string;
  saleId?: string;
  amount: number;
  reason: string;
  noteDate?: string;
}

export async function listCreditNotes(db: Pool, applied?: boolean): Promise<CreditNoteRow[]> {
  const whereApplied = applied !== undefined ? `AND cn.applied = ${applied}` : '';
  const result = await db.query<CreditNoteRow>(`
    SELECT
      cn.id, cn.customer_id, c.name AS customer_name,
      cn.sale_id, cn.amount::text, cn.reason,
      cn.note_date::text, cn.applied,
      cn.applied_at::text, cn.created_at::text
    FROM credit_notes cn
    JOIN customers c ON c.id = cn.customer_id
    WHERE true ${whereApplied}
    ORDER BY cn.note_date DESC, cn.created_at DESC
    LIMIT 100
  `);
  return result.rows;
}

export async function createCreditNote(db: Pool, data: NewCreditNote): Promise<CreditNoteRow> {
  const result = await db.query<CreditNoteRow>(`
    INSERT INTO credit_notes (customer_id, sale_id, amount, reason, note_date)
    VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE))
    RETURNING
      id, customer_id,
      (SELECT name FROM customers WHERE id = customer_id) AS customer_name,
      sale_id, amount::text, reason,
      note_date::text, applied, applied_at::text, created_at::text
  `, [
    data.customerId,
    data.saleId ?? null,
    data.amount,
    data.reason,
    data.noteDate ?? null,
  ]);
  return result.rows[0];
}
