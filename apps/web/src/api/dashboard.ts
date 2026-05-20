import type { Summary, Debt, Aging, TrendPoint, Activity, Payment, UpcomingDue, CreditNote, WriteOff, CreateCreditNoteInput, CreateWriteOffInput } from '@suma/types';
import { apiFetch } from './client';

export const fetchSummary       = ()           => apiFetch<Summary>('/api/summary');
export const fetchDebts         = ()           => apiFetch<Debt[]>('/api/debts');
export const fetchAging         = ()           => apiFetch<Aging[]>('/api/aging');
export const fetchTrend         = ()           => apiFetch<TrendPoint[]>('/api/collection-trend');
export const fetchActivity      = (days = 1)  => apiFetch<Activity>(`/api/activity?days=${days}`);
export const fetchPayments      = (limit = 20) => apiFetch<Payment[]>(`/api/payments?limit=${limit}`);
export const fetchUpcomingDues  = (days = 30)  => apiFetch<UpcomingDue[]>(`/api/upcoming-dues?days=${days}`);
export const fetchCreditNotes   = (applied?: boolean) => {
  const q = applied !== undefined ? `?applied=${applied}` : '';
  return apiFetch<CreditNote[]>(`/api/credit-notes${q}`);
};
export const fetchWriteOffs     = () => apiFetch<WriteOff[]>('/api/write-offs');

export const createCreditNote = (data: CreateCreditNoteInput) =>
  apiFetch<CreditNote>('/api/credit-notes', { method: 'POST', body: JSON.stringify(data) });

export const createWriteOff = (data: CreateWriteOffInput) =>
  apiFetch<WriteOff>('/api/write-offs', { method: 'POST', body: JSON.stringify(data) });
