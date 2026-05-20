import type { Customer, CustomerHistory, CreateCustomerInput, UpdateCustomerInput } from '@suma/types';
import { apiFetch } from './client';

export const fetchCustomers     = ()              => apiFetch<Customer[]>('/api/customers');
export const fetchCustomerHistory = (id: string) => apiFetch<CustomerHistory>(`/api/customers/${id}/history`);

export const createCustomer = (data: CreateCustomerInput) =>
  apiFetch<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(data) });

export const updateCustomer = (id: string, data: UpdateCustomerInput) =>
  apiFetch<Customer>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const setCustomerActive = (id: string, active: boolean) =>
  apiFetch<{ success: boolean }>(`/api/customers/${id}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
