import { useState, useEffect } from 'react';
import type { Debt, PaymentMethod } from '@suma/types';
import { useCreatePayment } from '../../hooks/useDashboard';
import { formatCOP, formatMoneyInput, parseMoneyInput } from '../../lib/formatters';

const METHODS: PaymentMethod[] = ['Efectivo', 'Nequi', 'Transferencia', 'Daviplata', 'Otro'];

const labelCls = 'block text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em] mb-1.5';

interface Props {
  debt: Debt | { id: string; name: string; company: string | null; pendingBalance: number } | null;
  onClose: () => void;
}

export function PaymentPanel({ debt, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Efectivo');
  const [notes, setNotes]   = useState('');
  const { mutateAsync, isPending, error, reset } = useCreatePayment();

  useEffect(() => {
    if (debt) { setAmount(''); setMethod('Efectivo'); setNotes(''); reset(); }
  }, [debt?.id]);

  const open = !!debt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseMoneyInput(amount);
    if (!parsed || !debt) return;
    await mutateAsync({ customerId: debt.id, amount: parsed, paymentMethod: method, notes: notes.trim() || null });
    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/25 z-40 backdrop-blur-[2px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-card flex flex-col border-l border-line z-50 transition-transform duration-200 shadow-panel ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Registrar pago</p>
          <button onClick={onClose} className="text-ink-4 hover:text-ink transition-colors text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 thin-scroll">

          {debt && (
            <div className="bg-card-2 border border-line rounded-md p-4">
              <p className={labelCls}>Cliente</p>
              <p className="text-sm font-semibold text-ink">{debt.name}</p>
              {'company' in debt && debt.company && (
                <p className="text-xs text-ink-3 mt-0.5">{debt.company}</p>
              )}
              <div className="mt-3 pt-3 border-t border-line flex items-baseline justify-between">
                <span className={labelCls.replace(' mb-1.5', '')}>Saldo pendiente</span>
                <span className="text-base font-semibold text-ink font-mono num">{formatCOP(debt.pendingBalance)}</span>
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Monto</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 text-sm font-mono">$</span>
              <input
                value={amount}
                onChange={e => setAmount(formatMoneyInput(e.target.value))}
                inputMode="numeric"
                placeholder="0"
                required
                className="w-full border border-line-2 rounded-md pl-7 pr-4 py-2.5 text-base font-mono num text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Método de pago</label>
            <div className="grid grid-cols-3 gap-1.5">
              {METHODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`text-xs font-semibold border py-2 rounded-md transition-colors ${
                    method === m
                      ? 'bg-ink text-white border-ink'
                      : 'bg-card text-ink-2 border-line-2 hover:border-ink-4'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Opcional"
              className="w-full border border-line-2 rounded-md px-3.5 py-2.5 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-ink hover:bg-ink-2 disabled:opacity-50 text-white rounded-md py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {isPending && <span className="animate-spin text-base leading-none">↻</span>}
            {isPending ? 'Registrando…' : 'Registrar pago'}
          </button>

          {error && (
            <p className="text-danger-text text-xs text-center">{error.message}</p>
          )}
        </form>
      </div>
    </>
  );
}
