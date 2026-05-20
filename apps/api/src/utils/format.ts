const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export function formatAmount(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return '$' + Math.round(num).toLocaleString('es-CO').replace(/,/g, '.');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use UTC to avoid timezone offset issues with Postgres DATE fields
  return `${d.getUTCDate()}/${MONTHS[d.getUTCMonth()]}/${d.getUTCFullYear()}`;
}

export function parseAmount(input: string): number | null {
  const text = input.trim().toLowerCase().replace(/\s+/g, '');

  // "1.5m" or "1.5M" → 1500000
  const millions = text.match(/^(\d+(?:[.,]\d+)?)m$/);
  if (millions) {
    const value = parseFloat(millions[1].replace(',', '.')) * 1_000_000;
    return value > 0 ? Math.round(value) : null;
  }

  // "50mil" → 50000
  const thousands = text.match(/^(\d+(?:[.,]\d+)?)mil$/);
  if (thousands) {
    const value = parseFloat(thousands[1].replace(',', '.')) * 1_000;
    return value > 0 ? Math.round(value) : null;
  }

  // "50.000" (Colombian thousands separator) or "50000" or "50,000"
  const clean = text.replace(/\./g, '').replace(/,/g, '');
  const number = parseFloat(clean);
  if (isNaN(number) || number <= 0) return null;
  return Math.round(number);
}
