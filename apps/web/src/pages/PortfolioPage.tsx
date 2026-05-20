import { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { useDebts, usePayments, useVoidPayment, useCreditNotes, useWriteOffs, useCreateCreditNote, useCreateWriteOff } from '../hooks/useDashboard';
import { useAuthStore } from '../store/auth.store';
import { PaymentPanel } from '../components/panels/PaymentPanel';
import { ProfileView } from '../components/panels/ProfileView';
import { Card, CardHeader, SectionLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatCOP, daysLabel, daysBetween } from '../lib/formatters';
import type { Debt } from '@suma/types';

type Tab = 'balances' | 'payments' | 'adjustments';
type AdjustmentsTab = 'notes' | 'writeoffs';
type PaymentTarget = Pick<Debt, 'id' | 'name' | 'company' | 'pendingBalance'>;

function agingVariant(days: number | null): 'emerald' | 'amber' | 'orange' | 'red' | 'default' {
  if (days == null) return 'default';
  if (days <= 30)   return 'emerald';
  if (days <= 60)   return 'amber';
  if (days <= 90)   return 'orange';
  return 'red';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const EMPTY_FORM = { customerId: '', amount: '', reason: '' };

export function PortfolioPage() {
  const { user } = useAuthStore();
  const canAdjust = user?.role === 'admin' || user?.role === 'contabilidad';

  const [tab, setTab]               = useState<Tab>('balances');
  const [adjustmentsTab, setAdjustmentsTab] = useState<AdjustmentsTab>('notes');
  const [confirmVoidId, setConfirmVoidId] = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [profileId, setProfileId]   = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | undefined>();
  const [paymentDebt, setPaymentDebt] = useState<PaymentTarget | null>(null);

  const [noteForm,    setNoteForm]    = useState(EMPTY_FORM);
  const [writeOffForm, setWriteOffForm] = useState(EMPTY_FORM);
  const [noteError,     setNoteError]     = useState('');
  const [writeOffError,  setWriteOffError]  = useState('');

  const { data: debts = [] }       = useDebts();
  const { data: payments = [] }    = usePayments();
  const { data: creditNotes = [] } = useCreditNotes();
  const { data: writeOffs = [] }   = useWriteOffs();
  const voidMutation  = useVoidPayment();
  const createNote    = useCreateCreditNote();
  const createWriteOff = useCreateWriteOff();

  const q        = search.toLowerCase();
  const filtered = q
    ? debts.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company ?? '').toLowerCase().includes(q) ||
        (c.neighborhood ?? '').toLowerCase().includes(q),
      )
    : debts;

  const debtorOptions  = debts.filter(d => d.pendingBalance > 0);
  const pendingNotes   = creditNotes.filter(n => !n.applied);
  const appliedNotes   = creditNotes.filter(n => n.applied);
  const writeOffTotal  = writeOffs.reduce((s, w) => s + w.amount, 0);

  function openProfile(c: Debt) { setProfileId(c.id); setProfileName(c.name); }

  async function handleVoid(id: string) {
    await voidMutation.mutateAsync(id);
    setConfirmVoidId(null);
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    setNoteError('');
    const amount = parseFloat(noteForm.amount);
    if (!noteForm.customerId)         return setNoteError('Selecciona un cliente.');
    if (!amount || amount <= 0)       return setNoteError('El monto debe ser mayor a 0.');
    if (!noteForm.reason.trim())      return setNoteError('El motivo es obligatorio.');
    try {
      await createNote.mutateAsync({ customerId: noteForm.customerId, amount, reason: noteForm.reason.trim() });
      setNoteForm(EMPTY_FORM);
    } catch { setNoteError('Error al crear la nota. Intenta de nuevo.'); }
  }

  async function submitWriteOff(e: React.FormEvent) {
    e.preventDefault();
    setWriteOffError('');
    const amount = parseFloat(writeOffForm.amount);
    if (!writeOffForm.customerId)      return setWriteOffError('Selecciona un cliente.');
    if (!amount || amount <= 0)       return setWriteOffError('El monto debe ser mayor a 0.');
    if (!writeOffForm.reason.trim())   return setWriteOffError('El motivo es obligatorio.');
    if (!confirm(`¿Registrar castigo de ${formatCOP(amount)} para este cliente?`)) return;
    try {
      await createWriteOff.mutateAsync({ customerId: writeOffForm.customerId, amount, reason: writeOffForm.reason.trim() });
      setWriteOffForm(EMPTY_FORM);
    } catch { setWriteOffError('Error al registrar el castigo. Intenta de nuevo.'); }
  }

  if (profileId) {
    return (
      <>
        <ProfileView customerId={profileId} customerName={profileName} onBack={() => setProfileId(null)} onPayment={d => setPaymentDebt(d)} />
        <PaymentPanel debt={paymentDebt} onClose={() => setPaymentDebt(null)} />
      </>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'balances', label: 'Saldos' },
    { key: 'payments',  label: 'Pagos'  },
    ...(canAdjust ? [{ key: 'adjustments' as Tab, label: 'Ajustes' }] : []),
  ];

  return (
    <>
      <div className="space-y-4">

        {/* Tab bar */}
        <div className="inline-flex items-center bg-card-2 border border-line rounded-md p-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm font-medium px-4 py-1.5 rounded transition-all duration-150 ${
                tab === t.key ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Saldos ── */}
        {tab === 'balances' && (
          <Card noPad>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <SectionLabel>Saldos pendientes</SectionLabel>
                <span className="text-xs text-ink-4 font-mono num">{filtered.length}</span>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente…"
                className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent w-full sm:w-52 transition"
              />
            </CardHeader>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-line">
              {filtered.length === 0 && (
                <p className="px-5 py-10 text-center text-ink-4 text-sm">Sin resultados</p>
              )}
              {filtered.map(c => (
                <div key={c.id} className="px-5 py-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button onClick={() => openProfile(c)} className="text-sm font-semibold text-ink truncate hover:text-accent text-left transition-colors">
                        {c.name}
                      </button>
                      <div className="text-xs text-ink-3 mt-0.5 truncate">
                        {c.company && `${c.company} · `}{c.neighborhood ?? c.phone ?? ''}
                      </div>
                      <Badge variant={agingVariant(daysBetween(c.lastPaymentDate))} className="mt-1.5">
                        {daysLabel(c.lastPaymentDate)}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-ink-4 font-semibold uppercase tracking-[0.12em]">Saldo</p>
                      <p className="text-base font-semibold text-ink font-mono num leading-tight">{formatCOP(c.pendingBalance)}</p>
                      <ProgressBar value={c.totalPaid} max={c.totalDebt} className="mt-1.5 justify-end" />
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentDebt(c)}
                    className="self-end text-xs font-semibold bg-ink hover:bg-ink-2 text-white rounded-md px-3.5 py-1.5 transition-colors"
                  >
                    Cobrar
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <table className="hidden sm:table w-full">
              <thead className="bg-card-2 border-b border-line">
                <tr className="text-left text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em]">
                  <th className="px-5 py-3 w-8">#</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3 hidden md:table-cell">Barrio</th>
                  <th className="px-5 py-3">Último pago</th>
                  <th className="px-5 py-3 text-right">Saldo</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-ink-4 text-sm">Sin resultados</td></tr>
                )}
                {filtered.map((c, i) => (
                  <tr key={c.id} className="hover:bg-card-2/60 transition-colors">
                    <td className="px-5 py-3.5 text-ink-4 text-xs font-mono num">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openProfile(c)} className="text-sm font-semibold text-ink hover:text-accent text-left transition-colors">
                        {c.name}
                      </button>
                      {c.phone && <div className="text-xs text-ink-3 mt-0.5 font-mono">{c.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-2">{c.company ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-2 hidden md:table-cell">{c.neighborhood ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={agingVariant(daysBetween(c.lastPaymentDate))}>{daysLabel(c.lastPaymentDate)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="text-sm font-semibold text-ink font-mono num" title={`${formatCOP(c.totalPaid)} pagado de ${formatCOP(c.totalDebt)}`}>
                        {formatCOP(c.pendingBalance)}
                      </div>
                      <ProgressBar value={c.totalPaid} max={c.totalDebt} className="mt-1.5 justify-end" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setPaymentDebt(c)}
                        className="text-xs font-semibold bg-ink hover:bg-ink-2 text-white rounded-md px-3.5 py-1.5 transition-colors whitespace-nowrap"
                      >
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t border-line bg-card-2">
                    <td colSpan={5} className="px-5 py-3 text-right text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em]">
                      Total cartera
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-ink font-mono num">
                      {formatCOP(filtered.reduce((s, c) => s + c.pendingBalance, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </Card>
        )}

        {/* ── Pagos ── */}
        {tab === 'payments' && (
          <Card noPad>
            <CardHeader>
              <div className="flex items-baseline gap-2.5">
                <SectionLabel>Pagos recientes</SectionLabel>
                <span className="text-xs text-ink-4 font-mono num">{payments.length}</span>
              </div>
              <p className="text-xs text-ink-3 mt-0.5">Últimos 20 cobros · clic en anular para revertir</p>
            </CardHeader>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-line">
              {payments.length === 0 && (
                <p className="px-5 py-10 text-center text-ink-4 text-sm">Sin pagos registrados</p>
              )}
              {payments.map(p => (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{p.customerName}</p>
                    <p className="text-xs text-ink-3 mt-0.5">
                      <span className="font-mono">{daysLabel(p.paymentDate)}</span>
                      <span className="mx-1.5 text-ink-4">·</span>
                      {p.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-ink font-mono num">{formatCOP(p.amount)}</span>
                    {confirmVoidId === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleVoid(p.id)}
                          disabled={voidMutation.isPending}
                          className="text-xs font-semibold text-white bg-danger rounded px-2 py-0.5 transition-colors disabled:opacity-50"
                        >
                          {voidMutation.isPending ? '…' : 'Sí'}
                        </button>
                        <button
                          onClick={() => setConfirmVoidId(null)}
                          className="text-xs text-ink-4 hover:text-ink transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmVoidId(p.id)}
                        className="text-xs font-medium border border-danger/40 text-danger-text hover:bg-danger/10 hover:border-danger rounded px-2 py-0.5 transition-colors"
                      >
                        Anular
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <table className="hidden sm:table w-full">
              <thead className="bg-card-2 border-b border-line">
                <tr className="text-left text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em]">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Método</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-4 text-sm">Sin pagos registrados</td></tr>
                )}
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-card-2/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-ink-2 font-mono num whitespace-nowrap">{daysLabel(p.paymentDate)}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-ink">{p.customerName}</p>
                      {p.customerCompany && <p className="text-xs text-ink-3 mt-0.5">{p.customerCompany}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-2">{p.method}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-semibold text-ink font-mono num">{formatCOP(p.amount)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {confirmVoidId === p.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVoid(p.id)}
                            disabled={voidMutation.isPending}
                            className="text-xs font-semibold text-white bg-danger hover:bg-danger/80 rounded px-2.5 py-1 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {voidMutation.isPending ? 'Anulando…' : 'Sí, anular'}
                          </button>
                          <button
                            onClick={() => setConfirmVoidId(null)}
                            className="text-xs font-medium text-ink-4 hover:text-ink transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmVoidId(p.id)}
                          className="text-xs font-medium border border-danger/40 text-danger-text hover:bg-danger/10 hover:border-danger rounded px-2.5 py-1 transition-colors whitespace-nowrap"
                        >
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── Ajustes ── */}
        {tab === 'adjustments' && canAdjust && (
          <div className="space-y-4">

            {/* Sub-tab bar */}
            <div className="inline-flex items-center bg-card-2 border border-line rounded-md p-0.5">
              {([['notes', 'Notas de crédito'], ['writeoffs', 'Castigos']] as [AdjustmentsTab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setAdjustmentsTab(key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded transition-all duration-150 ${
                    adjustmentsTab === key ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {adjustmentsTab === 'notes' && (
              <>
                <Card>
                  <SectionLabel className="mb-4">Nueva nota de crédito</SectionLabel>
                  <form onSubmit={submitNote} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.08em]">Cliente</label>
                      <select
                        value={noteForm.customerId}
                        onChange={e => setNoteForm(f => ({ ...f, customerId: e.target.value }))}
                        className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                      >
                        <option value="">Seleccionar…</option>
                        {debtorOptions.map(d => (
                          <option key={d.id} value={d.id}>{d.name} — {formatCOP(d.pendingBalance)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.08em]">Monto</label>
                      <input
                        type="number" min="1" step="any" placeholder="0"
                        value={noteForm.amount}
                        onChange={e => setNoteForm(f => ({ ...f, amount: e.target.value }))}
                        className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.08em]">Motivo</label>
                      <input
                        type="text" placeholder="ej. Devolución por mercancía defectuosa"
                        value={noteForm.reason}
                        onChange={e => setNoteForm(f => ({ ...f, reason: e.target.value }))}
                        className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                      />
                    </div>
                    <button type="submit" disabled={createNote.isPending}
                      className="px-4 py-2 text-sm font-semibold bg-ink hover:bg-ink-2 text-white rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {createNote.isPending ? 'Creando…' : 'Crear nota'}
                    </button>
                  </form>
                  {noteError && <p className="mt-2 text-xs text-danger-text">{noteError}</p>}
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SectionLabel>Pendientes</SectionLabel>
                      {pendingNotes.length > 0 && <span className="text-[11px] font-mono text-ink-4">{pendingNotes.length}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-ink-4">
                      <Clock className="size-3 shrink-0" />
                      {formatCOP(pendingNotes.reduce((s, n) => s + n.amount, 0))} por aplicar
                    </div>
                  </div>
                  {pendingNotes.length === 0 ? (
                    <p className="text-xs text-ink-4 p-4">Sin notas pendientes</p>
                  ) : pendingNotes.map(n => (
                    <div key={n.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-0 hover:bg-canvas transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink leading-tight truncate">{n.customerName}</p>
                        <p className="text-[11px] text-ink-4 truncate">{n.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-ink num">{formatCOP(n.amount)}</p>
                        <p className="text-[11px] text-ink-4">{formatDate(n.noteDate)}</p>
                      </div>
                    </div>
                  ))}
                </Card>

                {appliedNotes.length > 0 && (
                  <Card className="p-0 overflow-hidden">
                    <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                      <SectionLabel>Aplicadas</SectionLabel>
                      <CheckCircle2 className="size-3.5 text-success shrink-0" />
                    </div>
                    {appliedNotes.map(n => (
                      <div key={n.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-0 opacity-60">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink leading-tight truncate">{n.customerName}</p>
                          <p className="text-[11px] text-ink-4 truncate">{n.reason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-ink num">{formatCOP(n.amount)}</p>
                          <p className="text-[11px] text-ink-4">{formatDate(n.noteDate)}</p>
                        </div>
                      </div>
                    ))}
                  </Card>
                )}
              </>
            )}

            {adjustmentsTab === 'writeoffs' && (
              <>
                <div className="rounded-md border border-warn-text/30 bg-warn-text/5 px-4 py-3 text-xs text-warn-text leading-relaxed">
                  Un castigo elimina deuda incobrable del portafolio contable. El cliente sigue debiendo — este registro es solo para que los libros reflejen la realidad.
                </div>

                <Card>
                  <SectionLabel className="mb-4">Registrar castigo</SectionLabel>
                  <form onSubmit={submitWriteOff} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.08em]">Cliente</label>
                      <select
                        value={writeOffForm.customerId}
                        onChange={e => setWriteOffForm(f => ({ ...f, customerId: e.target.value }))}
                        className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                      >
                        <option value="">Seleccionar…</option>
                        {debtorOptions.map(d => (
                          <option key={d.id} value={d.id}>{d.name} — {formatCOP(d.pendingBalance)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.08em]">Monto</label>
                      <input
                        type="number" min="1" step="any" placeholder="0"
                        value={writeOffForm.amount}
                        onChange={e => setWriteOffForm(f => ({ ...f, amount: e.target.value }))}
                        className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-medium text-ink-4 uppercase tracking-[0.08em]">Motivo</label>
                      <input
                        type="text" placeholder="ej. Cliente insolvente, deuda incobrable"
                        value={writeOffForm.reason}
                        onChange={e => setWriteOffForm(f => ({ ...f, reason: e.target.value }))}
                        className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                      />
                    </div>
                    <button type="submit" disabled={createWriteOff.isPending}
                      className="px-4 py-2 text-sm font-semibold bg-danger hover:bg-danger/80 text-white rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {createWriteOff.isPending ? 'Registrando…' : 'Registrar'}
                    </button>
                  </form>
                  {writeOffError && <p className="mt-2 text-xs text-danger-text">{writeOffError}</p>}
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                    <SectionLabel>Castigos del año</SectionLabel>
                    {writeOffTotal > 0 && (
                      <span className="text-xs font-semibold text-danger-text num">{formatCOP(writeOffTotal)}</span>
                    )}
                  </div>
                  {writeOffs.length === 0 ? (
                    <p className="text-xs text-ink-4 p-4">Sin castigos registrados este año</p>
                  ) : writeOffs.map(w => (
                    <div key={w.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-0 hover:bg-canvas transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink leading-tight truncate">{w.customerName}</p>
                        <p className="text-[11px] text-ink-4 truncate">{w.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-danger-text num">{formatCOP(w.amount)}</p>
                        <p className="text-[11px] text-ink-4">{formatDate(w.writeOffDate)}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              </>
            )}

          </div>
        )}

      </div>

      <PaymentPanel debt={paymentDebt} onClose={() => setPaymentDebt(null)} />
    </>
  );
}
