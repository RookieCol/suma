import { Hono } from 'hono';
import { Pool } from 'pg';
import { serveStatic } from '@hono/node-server/serve-static';
import { requireAuth, requireRole } from '../auth/middleware';
import { listWithDebt, getAging, getBalance, getAvgPaymentDays, getUpcomingDues } from '../db/balances.repo';
import {
  getDailySummary,
  getCollectionTrend,
  getActivityReport,
  getRecentPayments,
  createPayment,
  voidPayment,
  getCustomerPayments,
  PaymentMethod,
} from '../db/payments.repo';
import { listAllCustomers, updateCustomer, setCustomerActive, createCustomer, findById } from '../db/customers.repo';
import { getAllCustomerSales } from '../db/sales.repo';
import { listCreditNotes, createCreditNote } from '../db/credit-notes.repo';
import { listWriteOffs, createWriteOff } from '../db/write-offs.repo';

export function createApiRouter(db: Pool): Hono {
  const router = new Hono();

  router.use('/public/*', serveStatic({ root: './' }));
  router.get('/dashboard', serveStatic({ path: './public/dashboard.html' }));

  // All /api/* routes require a valid Better Auth session
  router.use('/api/*', requireAuth);

  router.get('/api/summary', async (c) => {
    const [debts, report] = await Promise.all([
      listWithDebt(db),
      getDailySummary(db),
    ]);
    const totalPortfolio = debts.reduce((sum, c) => sum + parseFloat(c.pending_balance), 0);
    return c.json({
      totalPortfolio,
      collectedToday: parseFloat(report.total_collected),
      paymentsToday: parseInt(report.payments_count),
      customersToday: parseInt(report.customers_visited),
      customersWithDebt: debts.length,
    });
  });

  router.get('/api/debts', async (c) => {
    const debts = await listWithDebt(db);
    return c.json(debts.map((d) => ({
      id: d.id,
      name: d.name,
      company: d.company,
      neighborhood: d.neighborhood,
      phone: d.phone,
      zone: d.zone,
      customerType: d.customer_type,
      paymentTermsDays: d.payment_terms_days,
      creditLimit: d.credit_limit != null ? parseFloat(d.credit_limit) : null,
      totalDebt: parseFloat(d.total_debt),
      totalPaid: parseFloat(d.total_paid),
      pendingBalance: parseFloat(d.pending_balance),
      lastPaymentDate: d.last_payment_date,
      oldestSaleDate: d.oldest_sale_date,
    })));
  });

  router.get('/api/aging', async (c) => {
    const buckets = await getAging(db);
    return c.json(buckets.map((b) => ({
      bucket: b.bucket,
      amount: parseFloat(b.amount),
      customers: parseInt(b.customers),
    })));
  });

  router.get('/api/collection-trend', async (c) => {
    const days = parseInt(c.req.query('days') ?? '30');
    const trend = await getCollectionTrend(db, days);
    return c.json(trend.map((d) => ({
      day: d.day,
      total: parseFloat(d.total),
      count: parseInt(d.count),
    })));
  });

  router.get('/api/activity', async (c) => {
    const days = Math.max(1, parseInt(c.req.query('days') ?? '1'));
    const report = await getActivityReport(db, days);
    return c.json({
      days,
      totalCollected:   parseFloat(report.total_collected),
      paymentsCount:    parseInt(report.payments_count),
      customersVisited: parseInt(report.customers_visited),
      byMethod: report.by_method.map((m) => ({
        method: m.payment_method,
        total:  parseFloat(m.total),
        count:  parseInt(m.count),
      })),
    });
  });

  // ── Upcoming dues ──

  router.get('/api/upcoming-dues', async (c) => {
    const days = Math.min(90, Math.max(1, parseInt(c.req.query('days') ?? '30')));
    const rows = await getUpcomingDues(db, days);
    return c.json(rows.map((r) => ({
      id:           r.id,
      customerId:   r.customer_id,
      customerName: r.customer_name,
      neighborhood: r.neighborhood,
      phone:        r.phone,
      saleDate:     r.sale_date,
      dueDate:      r.due_date,
      description:  r.description,
      amount:       parseFloat(r.total_amount),
    })));
  });

  // ── Credit notes ──

  router.get('/api/credit-notes', async (c) => {
    const appliedParam = c.req.query('applied');
    const applied = appliedParam === 'true' ? true : appliedParam === 'false' ? false : undefined;
    const notes = await listCreditNotes(db, applied);
    return c.json(notes.map((n) => ({
      id:           n.id,
      customerId:   n.customer_id,
      customerName: n.customer_name,
      saleId:       n.sale_id,
      amount:       parseFloat(n.amount),
      reason:       n.reason,
      noteDate:     n.note_date,
      applied:      n.applied,
      appliedAt:    n.applied_at,
      createdAt:    n.created_at,
    })));
  });

  router.post('/api/credit-notes', requireRole('admin', 'contabilidad'), async (c) => {
    let body: { customerId?: string; saleId?: string; amount?: number; reason?: string; noteDate?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }
    if (!body.customerId)                                    return c.json({ error: 'customerId is required' }, 400);
    if (typeof body.amount !== 'number' || body.amount <= 0) return c.json({ error: 'amount must be > 0' }, 400);
    if (!body.reason?.trim())                                return c.json({ error: 'reason is required' }, 400);

    const note = await createCreditNote(db, {
      customerId: body.customerId,
      saleId:     body.saleId,
      amount:     body.amount,
      reason:     body.reason.trim(),
      noteDate:   body.noteDate,
    });
    return c.json({
      id:           note.id,
      customerId:   note.customer_id,
      customerName: note.customer_name,
      saleId:       note.sale_id,
      amount:       parseFloat(note.amount),
      reason:       note.reason,
      noteDate:     note.note_date,
      applied:      note.applied,
      appliedAt:    note.applied_at,
      createdAt:    note.created_at,
    }, 201);
  });

  // ── Write-offs ──

  router.get('/api/write-offs', async (c) => {
    const yearOnly = c.req.query('year') !== 'all';
    const items = await listWriteOffs(db, yearOnly);
    return c.json(items.map((w) => ({
      id:            w.id,
      customerId:    w.customer_id,
      customerName:  w.customer_name,
      amount:        parseFloat(w.amount),
      reason:        w.reason,
      writeOffDate:  w.write_off_date,
      createdAt:     w.created_at,
    })));
  });

  router.post('/api/write-offs', requireRole('admin', 'contabilidad'), async (c) => {
    let body: { customerId?: string; amount?: number; reason?: string; writeOffDate?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }
    if (!body.customerId)                                    return c.json({ error: 'customerId is required' }, 400);
    if (typeof body.amount !== 'number' || body.amount <= 0) return c.json({ error: 'amount must be > 0' }, 400);
    if (!body.reason?.trim())                                return c.json({ error: 'reason is required' }, 400);

    const item = await createWriteOff(db, {
      customerId:   body.customerId,
      amount:       body.amount,
      reason:       body.reason.trim(),
      writeOffDate: body.writeOffDate,
    });
    return c.json({
      id:           item.id,
      customerId:   item.customer_id,
      customerName: item.customer_name,
      amount:       parseFloat(item.amount),
      reason:       item.reason,
      writeOffDate: item.write_off_date,
      createdAt:    item.created_at,
    }, 201);
  });

  // ── Payments ──

  router.get('/api/payments', async (c) => {
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20')));
    const payments = await getRecentPayments(db, limit);
    return c.json(payments.map((p) => ({
      id:              p.id,
      paymentDate:     p.payment_date,
      amount:          parseFloat(p.amount),
      method:          p.payment_method,
      notes:           p.notes,
      customerId:      p.customer_id,
      customerName:    p.customer_name,
      customerCompany: p.customer_company,
    })));
  });

  router.post('/api/payments', requireRole('admin', 'vendedor'), async (c) => {
    let body: { customerId?: string; amount?: number; paymentMethod?: string; notes?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }

    const validMethods: PaymentMethod[] = ['Efectivo', 'Nequi', 'Transferencia', 'Daviplata', 'Otro'];

    if (!body.customerId)                              return c.json({ error: 'customerId is required' }, 400);
    if (typeof body.amount !== 'number' || body.amount <= 0) return c.json({ error: 'amount must be > 0' }, 400);
    if (!validMethods.includes(body.paymentMethod as PaymentMethod)) {
      return c.json({ error: 'invalid paymentMethod' }, 400);
    }

    const payment = await createPayment(db, {
      customerId:    body.customerId,
      amount:        body.amount,
      paymentMethod: body.paymentMethod as PaymentMethod,
      notes:         body.notes?.trim() || null,
    });
    return c.json(payment, 201);
  });

  router.delete('/api/payments/:id', requireRole('admin'), async (c) => {
    const id = c.req.param('id');
    const ok = await voidPayment(db, id);
    if (!ok) return c.json({ error: 'Payment not found' }, 404);
    return c.json({ success: true });
  });

  // ── Customers CRUD ──

  router.get('/api/customers/:id/history', async (c) => {
    const id = c.req.param('id');
    const [customer, balance, sales, payments, avgPaymentDays] = await Promise.all([
      findById(db, id),
      getBalance(db, id),
      getAllCustomerSales(db, id),
      getCustomerPayments(db, id),
      getAvgPaymentDays(db, id),
    ]);

    if (!customer) return c.json({ error: 'Customer not found' }, 404);

    const timeline = [
      ...sales.map((s) => ({
        kind:        'sale' as const,
        date:        s.sale_date,
        description: s.description,
        amount:      parseFloat(s.total_amount),
      })),
      ...payments.map((p) => ({
        kind:   'payment' as const,
        date:   p.payment_date,
        method: p.payment_method,
        amount: parseFloat(p.amount),
        voided: p.voided,
        id:     p.id,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({
      customer: {
        id:           customer.id,
        name:         customer.name,
        company:      customer.company,
        phone:        customer.phone,
        address:      customer.address,
        neighborhood: customer.neighborhood,
        notes:        customer.notes,
        active:       customer.active,
        createdAt:    customer.created_at,
      },
      balance: balance ? {
        totalDebt:      parseFloat(balance.total_debt),
        totalPaid:      parseFloat(balance.total_paid),
        pendingBalance: parseFloat(balance.pending_balance),
      } : { totalDebt: 0, totalPaid: 0, pendingBalance: 0 },
      timeline,
      avgPaymentDays,
    });
  });

  router.get('/api/customers', async (c) => {
    const customers = await listAllCustomers(db);
    return c.json(customers);
  });

  router.post('/api/customers', requireRole('admin'), async (c) => {
    let body: Record<string, string>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }
    if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400);

    const created = await createCustomer(db, {
      name:         body.name.trim(),
      company:      body.company?.trim() || undefined,
      phone:        body.phone?.trim() || undefined,
      address:      body.address?.trim() || undefined,
      neighborhood: body.neighborhood?.trim() || undefined,
    });
    return c.json(created, 201);
  });

  router.put('/api/customers/:id', requireRole('admin', 'vendedor'), async (c) => {
    const id = c.req.param('id');
    let body: Record<string, string>;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }
    if (!body.name?.trim()) return c.json({ error: 'name is required' }, 400);

    const updated = await updateCustomer(db, id, {
      name:         body.name.trim(),
      company:      body.company?.trim(),
      phone:        body.phone?.trim(),
      address:      body.address?.trim(),
      neighborhood: body.neighborhood?.trim(),
      notes:        body.notes?.trim(),
    });

    if (!updated) return c.json({ error: 'Customer not found' }, 404);
    return c.json(updated);
  });

  router.patch('/api/customers/:id/active', requireRole('admin'), async (c) => {
    const id = c.req.param('id');
    let body: { active: boolean };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400);
    }
    const ok = await setCustomerActive(db, id, body.active);
    if (!ok) return c.json({ error: 'Customer not found' }, 404);
    return c.json({ success: true });
  });

  // ── Profile ──

  router.get('/api/profile', async (c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUser = (c as any).get('authUser') as { id: string };
    const { rows } = await db.query<{
      id: string; name: string; email: string; role: string | null; telegramId: string | null;
    }>(
      `SELECT id, name, email, role, "telegramId" FROM "user" WHERE id = $1`,
      [sessionUser.id],
    );
    if (!rows[0]) return c.json({ error: 'Not found' }, 404);
    const u = rows[0];
    return c.json({ id: u.id, name: u.name, email: u.email, role: u.role, telegramId: u.telegramId });
  });

  router.patch('/api/profile', async (c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUser = (c as any).get('authUser') as { id: string };
    let body: { telegramId?: string | null };
    try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

    const raw = body.telegramId;
    const tid = (raw === '' || raw == null) ? null : String(raw).trim();
    if (tid !== null && !/^\d+$/.test(tid)) {
      return c.json({ error: 'El ID de Telegram debe ser un número entero' }, 400);
    }

    await db.query(
      `UPDATE "user" SET "telegramId" = $1, "updatedAt" = now() WHERE id = $2`,
      [tid, sessionUser.id],
    );
    return c.json({ ok: true });
  });

  return router;
}
