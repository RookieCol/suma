// ── Auth ──────────────────────────────────────────────

export type UserRole = 'admin' | 'vendedor' | 'contabilidad';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  telegramId: string | null;
}

export interface UpdateProfileInput {
  telegramId: string | null;
}

// ── Dashboard summary ─────────────────────────────────

export interface Summary {
  totalPortfolio: number;
  collectedToday: number;
  paymentsToday: number;
  customersToday: number;
  customersWithDebt: number;
}

// ── Debts ─────────────────────────────────────────────

export type CustomerType = 'mayorista' | 'confeccionista' | 'retail' | 'gobierno' | 'otro';

export interface Debt {
  id: string;
  name: string;
  company: string | null;
  neighborhood: string | null;
  phone: string | null;
  zone: string | null;
  customerType: CustomerType | null;
  paymentTermsDays: number | null;
  creditLimit: number | null;
  totalDebt: number;
  totalPaid: number;
  pendingBalance: number;
  lastPaymentDate: string | null;
  oldestSaleDate: string | null;
}

// ── Aging ─────────────────────────────────────────────

export type AgingBucket = '0-30' | '31-60' | '61-90' | '90+';

export interface Aging {
  bucket: AgingBucket;
  amount: number;
  customers: number;
}

// ── Trend ─────────────────────────────────────────────

export interface TrendPoint {
  day: string;
  total: number;
  count: number;
}

// ── Activity ──────────────────────────────────────────

export interface ActivityMethod {
  method: string;
  total: number;
  count: number;
}

export interface Activity {
  days: number;
  totalCollected: number;
  paymentsCount: number;
  customersVisited: number;
  byMethod: ActivityMethod[];
}

// ── Upcoming dues ─────────────────────────────────────

export interface UpcomingDue {
  id: string;
  customerId: string;
  customerName: string;
  neighborhood: string | null;
  phone: string | null;
  saleDate: string;
  dueDate: string;
  description: string | null;
  amount: number;
}

// ── Credit notes ──────────────────────────────────────

export interface CreditNote {
  id: string;
  customerId: string;
  customerName: string;
  saleId: string | null;
  amount: number;
  reason: string;
  noteDate: string;
  applied: boolean;
  appliedAt: string | null;
  createdAt: string;
}

export interface CreateCreditNoteInput {
  customerId: string;
  saleId?: string;
  amount: number;
  reason: string;
  noteDate?: string;
}

// ── Write-offs ────────────────────────────────────────

export interface WriteOff {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  writeOffDate: string;
  createdAt: string;
}

export interface CreateWriteOffInput {
  customerId: string;
  amount: number;
  reason: string;
  writeOffDate?: string;
}

// ── Payments ──────────────────────────────────────────

export type PaymentMethod = 'Efectivo' | 'Nequi' | 'Transferencia' | 'Daviplata' | 'Otro';

export interface Payment {
  id: string;
  paymentDate: string;
  amount: number;
  method: string;
  notes: string | null;
  customerId: string;
  customerName: string;
  customerCompany: string | null;
}

export interface CreatePaymentInput {
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

// ── Customers ─────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  notes: string | null;
  active: boolean;
}

export interface CreateCustomerInput {
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  notes?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

// ── Customer history ──────────────────────────────────

export interface CustomerBalance {
  totalDebt: number;
  totalPaid: number;
  pendingBalance: number;
}

export type TimelineEntry =
  | { kind: 'sale';    date: string; description: string | null; amount: number }
  | { kind: 'payment'; date: string; method: string; amount: number; voided: boolean; id: string };

export interface CustomerHistory {
  customer: Customer & { createdAt: string };
  balance: CustomerBalance;
  timeline: TimelineEntry[];
  avgPaymentDays: number | null;
}

// ── Admin users ───────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  createdAt: string;
  banned: boolean | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
