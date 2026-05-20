import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSummary, fetchDebts, fetchAging, fetchTrend, fetchActivity, fetchPayments,
  fetchUpcomingDues, fetchCreditNotes, fetchWriteOffs, createCreditNote, createWriteOff,
} from '../api/dashboard';
import { fetchCustomers, fetchCustomerHistory, createCustomer, updateCustomer, setCustomerActive } from '../api/customers';
import { createPayment, voidPayment } from '../api/payments';
import { listUsers, adminCreateUser, setUserRole, removeUser } from '../api/auth';
import type { CreateUserInput, CreateCreditNoteInput, CreateWriteOffInput } from '@suma/types';

export const keys = {
  summary:      ['summary']                    as const,
  debts:        ['debts']                      as const,
  aging:        ['aging']                      as const,
  trend:        ['trend']                      as const,
  activity:     (days: number) => ['activity', days] as const,
  payments:     ['payments']                   as const,
  customers:    ['customers']                  as const,
  history:      (id: string) => ['history', id]       as const,
  users:        ['users']                      as const,
  upcomingDues: (days: number) => ['upcoming-dues', days] as const,
  creditNotes:  ['credit-notes']               as const,
  writeOffs:    ['write-offs']                 as const,
};

export const useSummary   = () => useQuery({ queryKey: keys.summary,   queryFn: fetchSummary });
export const useDebts     = () => useQuery({ queryKey: keys.debts,     queryFn: fetchDebts });
export const useAging     = () => useQuery({ queryKey: keys.aging,     queryFn: fetchAging });
export const useTrend     = () => useQuery({ queryKey: keys.trend,     queryFn: fetchTrend });
export const usePayments  = () => useQuery({ queryKey: keys.payments,  queryFn: () => fetchPayments() });
export const useCustomers = () => useQuery({ queryKey: keys.customers, queryFn: fetchCustomers });
export const useCreditNotes = () => useQuery({ queryKey: keys.creditNotes, queryFn: () => fetchCreditNotes() });
export const useWriteOffs   = () => useQuery({ queryKey: keys.writeOffs,   queryFn: fetchWriteOffs });

export const useActivity = (days: number) =>
  useQuery({ queryKey: keys.activity(days), queryFn: () => fetchActivity(days) });

export const useUpcomingDues = (days: number) =>
  useQuery({ queryKey: keys.upcomingDues(days), queryFn: () => fetchUpcomingDues(days) });

export const useCustomerHistory = (id: string) =>
  useQuery({ queryKey: keys.history(id), queryFn: () => fetchCustomerHistory(id), enabled: !!id });

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => qc.invalidateQueries({ predicate: () => true }),
  });
}

export function useVoidPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: voidPayment,
    onSuccess: () => qc.invalidateQueries({ predicate: () => true }),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.customers }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCustomer>[1] }) =>
      updateCustomer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.customers }),
  });
}

export function useSetCustomerActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setCustomerActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.customers }),
  });
}

export const useUsers = () => useQuery({ queryKey: keys.users, queryFn: listUsers });

export function useAdminCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => adminCreateUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users }),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => setUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users }),
  });
}

export function useCreateCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCreditNoteInput) => createCreditNote(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.creditNotes }),
  });
}

export function useCreateWriteOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWriteOffInput) => createWriteOff(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.writeOffs }),
  });
}

export function useRemoveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users }),
  });
}
