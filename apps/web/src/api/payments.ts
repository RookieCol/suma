import type { Payment, CreatePaymentInput } from '@suma/types';
import { apiFetch } from './client';

export const createPayment = (data: CreatePaymentInput) =>
  apiFetch<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(data) });

export const voidPayment = (id: string) =>
  apiFetch<{ success: boolean }>(`/api/payments/${id}`, { method: 'DELETE' });
