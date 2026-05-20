import { useCustomerHistory } from '../../hooks/useDashboard';
import { formatCOP, formatShortDate } from '../../lib/formatters';
import { Badge } from '../ui/Badge';
import { Card, SectionLabel } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import type { Debt } from '@suma/types';

interface Props {
  customerId: string;
  customerName?: string;
  onBack: () => void;
  onPayment: (debt: Pick<Debt, 'id' | 'name' | 'company' | 'pendingBalance'>) => void;
}

export function ProfileView({ customerId, customerName, onBack, onPayment }: Props) {
  const { data, isLoading } = useCustomerHistory(customerId);
  const c = data?.customer;
  const b = data?.balance;

  const kpis = b && [
    { label: 'Total comprado',  value: formatCOP(b.totalDebt),     sub: `${data.timeline.filter(e => e.kind === 'sale').length} ventas`,                    color: 'text-ink' },
    { label: 'Total pagado',    value: formatCOP(b.totalPaid),     sub: `${data.timeline.filter(e => e.kind === 'payment' && !('voided' in e && e.voided)).length} pagos`, color: 'text-success-text' },
    { label: 'Saldo pendiente', value: formatCOP(b.pendingBalance), sub: null,                                                                               color: b.pendingBalance > 0 ? 'text-danger-text' : 'text-success-text' },
    { label: 'Paga en promedio', value: data.avgPaymentDays != null ? `${data.avgPaymentDays} días` : '—', sub: 'desde la venta',                           color: data.avgPaymentDays == null ? 'text-ink-4' : data.avgPaymentDays <= 15 ? 'text-success-text' : data.avgPaymentDays <= 30 ? 'text-warn-text' : 'text-danger-text' },
  ];

  return (
    <div className="space-y-4">

      {/* Breadcrumb + CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="text-xs font-medium text-ink-3 hover:text-ink transition-colors shrink-0">
            ← Volver
          </button>
          <span className="text-ink-4 text-xs">/</span>
          <span className="text-sm font-semibold text-ink truncate">{c?.name ?? customerName}</span>
          {c?.company && <span className="text-sm text-ink-3 truncate hidden sm:inline">{c.company}</span>}
          {c && (
            <Badge variant={c.active ? 'emerald' : 'red'} className="shrink-0">
              {c.active ? 'Activo' : 'Inactivo'}
            </Badge>
          )}
        </div>
        {b && b.pendingBalance > 0 && c && (
          <button
            onClick={() => onPayment({ id: c.id, name: c.name, company: c.company, pendingBalance: b.pendingBalance })}
            className="text-sm font-semibold bg-ink hover:bg-ink-2 text-white rounded-md px-5 py-2 transition-colors shrink-0 ml-4"
          >
            Registrar cobro
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40 text-ink-4 text-sm">
          <span className="animate-spin mr-2 text-base">↻</span> Cargando…
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Contact info */}
          <div className="space-y-4">
            <Card>
              <SectionLabel>Información</SectionLabel>
              <div className="space-y-3 mt-4">
                {c?.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-ink-4 text-sm shrink-0">📱</span>
                    <span className="text-sm text-ink-2 font-mono">{c.phone}</span>
                  </div>
                )}
                {c?.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-ink-4 text-sm shrink-0 mt-0.5">🏠</span>
                    <span className="text-sm text-ink-2 leading-snug">{c.address}</span>
                  </div>
                )}
                {c?.neighborhood && (
                  <div className="flex items-center gap-3">
                    <span className="text-ink-4 text-sm shrink-0">📍</span>
                    <span className="text-sm text-ink-2">{c.neighborhood}</span>
                  </div>
                )}
                {c?.createdAt && (
                  <div className="flex items-center gap-3 pt-3 border-t border-line mt-1">
                    <span className="text-ink-4 text-sm shrink-0">📅</span>
                    <span className="text-xs text-ink-3">Cliente desde <span className="text-ink-2 font-medium">{formatShortDate(c.createdAt)}</span></span>
                  </div>
                )}
                {!c?.phone && !c?.address && !c?.neighborhood && (
                  <p className="text-xs text-ink-4 italic">Sin información de contacto</p>
                )}
              </div>
              {c?.notes && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em] mb-1.5">Notas</p>
                  <p className="text-sm text-ink-3 italic leading-relaxed">{c.notes}</p>
                </div>
              )}
            </Card>
          </div>

          {/* KPIs + timeline */}
          <div className="lg:col-span-2 space-y-4">
            {kpis && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {kpis.map(k => (
                  <Card key={k.label} className="flex flex-col gap-2.5">
                    <SectionLabel>{k.label}</SectionLabel>
                    <p className={`text-[22px] font-semibold num leading-none tracking-tight ${k.color}`}>{k.value}</p>
                    {k.label === 'Saldo pendiente' && b && b.totalDebt > 0
                      ? <ProgressBar value={b.totalPaid} max={b.totalDebt} />
                      : k.sub && <p className="text-xs text-ink-3 num">{k.sub}</p>
                    }
                  </Card>
                ))}
              </div>
            )}

            <Card noPad>
              <div className="px-5 py-3.5 border-b border-line flex items-baseline gap-2.5">
                <SectionLabel>Historial de movimientos</SectionLabel>
                <span className="text-xs text-ink-4 font-mono num">{data?.timeline.length ?? 0}</span>
              </div>

              {data?.timeline.length === 0 && (
                <p className="px-5 py-10 text-center text-ink-4 text-sm">Sin movimientos registrados</p>
              )}

              {data && data.timeline.length > 0 && (
                <>
                  <table className="hidden sm:table w-full">
                    <thead className="bg-card-2 border-b border-line">
                      <tr className="text-left text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em]">
                        <th className="px-5 py-3">Tipo</th>
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Detalle</th>
                        <th className="px-5 py-3 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {data.timeline.map((entry, i) => {
                        const voided = 'voided' in entry && entry.voided;
                        return (
                          <tr key={i} className={`hover:bg-card-2/60 transition-colors ${voided ? 'opacity-40' : ''}`}>
                            <td className="px-5 py-3.5">
                              <Badge variant={entry.kind === 'sale' ? 'default' : 'emerald'}>
                                {entry.kind === 'sale' ? 'Venta' : 'Pago'}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-ink-3 font-mono num whitespace-nowrap">
                              {formatShortDate(entry.date)}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-ink-2">
                              {entry.kind === 'sale' ? (entry.description ?? '—') : entry.method}
                              {voided && <span className="ml-2 text-[9px] text-danger-text font-semibold uppercase">Anulado</span>}
                            </td>
                            <td className={`px-5 py-3.5 text-right text-sm font-semibold font-mono num ${entry.kind === 'sale' ? 'text-ink' : 'text-success-text'}`}>
                              {entry.kind === 'payment' ? '+' : ''}{formatCOP(entry.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="sm:hidden divide-y divide-line">
                    {data.timeline.map((entry, i) => {
                      const voided = 'voided' in entry && entry.voided;
                      return (
                        <div key={i} className={`px-5 py-3.5 flex items-center gap-3 ${voided ? 'opacity-40' : ''}`}>
                          <Badge variant={entry.kind === 'sale' ? 'default' : 'emerald'} className="shrink-0">
                            {entry.kind === 'sale' ? 'Venta' : 'Pago'}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-ink-2 truncate">
                              {entry.kind === 'sale' ? (entry.description ?? '—') : entry.method}
                            </p>
                            <p className="text-xs text-ink-4 font-mono mt-0.5">{formatShortDate(entry.date)}</p>
                          </div>
                          <span className={`text-sm font-semibold font-mono num shrink-0 ${entry.kind === 'sale' ? 'text-ink' : 'text-success-text'}`}>
                            {entry.kind === 'payment' ? '+' : ''}{formatCOP(entry.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
