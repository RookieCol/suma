export function formatCOP(v: number | null | undefined): string {
  if (v == null) return '—';
  return '$' + Math.round(v).toLocaleString('es-CO').replace(/,/g, '.');
}

export function daysBetween(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / 86400000);
}

export function daysLabel(dateStr: string | null | undefined): string {
  const d = daysBetween(dateStr);
  if (d == null) return 'Sin pagos';
  if (d === 0)   return 'Hoy';
  if (d === 1)   return 'Ayer';
  return `Hace ${d} días`;
}

export function formatMoneyInput(v: string): string {
  const digits = String(v ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('es-CO').replace(/,/g, '.');
}

export function parseMoneyInput(v: string): number {
  const digits = String(v ?? '').replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function agingClass(days: number | null): string {
  if (days == null) return 'bg-zinc-100 text-zinc-500';
  if (days <= 30)   return 'bg-emerald-50 text-emerald-700';
  if (days <= 60)   return 'bg-amber-50 text-amber-700';
  if (days <= 90)   return 'bg-orange-50 text-orange-700';
  return 'bg-red-50 text-red-700';
}
