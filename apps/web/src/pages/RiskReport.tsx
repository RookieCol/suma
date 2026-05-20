import { useState } from 'react';
import { AlertTriangle, Clock, FileX, ShieldAlert } from 'lucide-react';
import { useUpcomingDues, useCreditNotes, useWriteOffs, useDebts } from '../hooks/useDashboard';
import { Card, SectionLabel } from '../components/ui/Card';
import { ScrollFade } from '../components/ui/ScrollFade';
import { formatCOP } from '../lib/formatters';
import type { UpcomingDue, Debt } from '@suma/types';

const DUE_OPTIONS = [
  { days: 7,  label: '7 días'  },
  { days: 15, label: '15 días' },
  { days: 30, label: '30 días' },
];

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 9999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return `${diff}d`;
}

export function RiskReport() {
  const [dueDays, setDueDays] = useState(15);

  const { data: upcomingDues = [] } = useUpcomingDues(dueDays);
  const { data: creditNotes = [] }  = useCreditNotes();
  const { data: writeOffs = [] }    = useWriteOffs();
  const { data: debts = [] }        = useDebts();

  const riskClients = (debts as Debt[])
    .filter(d => d.pendingBalance > 0 && (d.lastPaymentDate === null || daysSince(d.lastPaymentDate as string | null) > 60))
    .sort((a, b) => b.pendingBalance - a.pendingBalance);

  const pendingNotes  = creditNotes.filter(n => !n.applied);
  const pendingNotesAmt = pendingNotes.reduce((s, n) => s + Number(n.amount), 0);
  const writeOffsAmt    = writeOffs.reduce((s, w) => s + Number(w.amount), 0);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[
          {
            label: 'Clientes en riesgo',
            value: String(riskClients.length),
            sub: '+60 días sin pago',
            Icon: ShieldAlert,
            cls: riskClients.length > 10 ? 'text-danger-text' : riskClients.length > 5 ? 'text-warn-text' : riskClients.length > 0 ? 'text-tang-text' : 'text-success-text',
          },
          {
            label: 'Saldo en riesgo',
            value: formatCOP(riskClients.reduce((s, d) => s + d.pendingBalance, 0)),
            sub: 'cartera en riesgo',
            Icon: AlertTriangle,
            cls: 'text-ink',
          },
          {
            label: 'Notas pendientes',
            value: String(pendingNotes.length),
            sub: `${formatCOP(pendingNotesAmt)} sin aplicar`,
            Icon: FileX,
            cls: pendingNotes.length > 0 ? 'text-warn-text' : 'text-ink',
          },
          {
            label: 'Castigos del año',
            value: formatCOP(writeOffsAmt),
            sub: `${writeOffs.length} registros`,
            Icon: Clock,
            cls: 'text-ink',
          },
        ].map(k => (
          <Card key={k.label}>
            <SectionLabel>{k.label}</SectionLabel>
            <p className={`text-2xl font-semibold num leading-none tracking-tight mt-3 ${k.cls}`}>{k.value}</p>
            <p className="text-xs text-ink-3 mt-2">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">

        {/* Left: upcoming dues */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <SectionLabel>Vencimientos próximos</SectionLabel>
            <div className="inline-flex items-center bg-card-2 border border-line rounded-md p-0.5">
              {DUE_OPTIONS.map(o => (
                <button key={o.days} onClick={() => setDueDays(o.days)}
                  className={`text-xs font-medium px-2 py-0.5 rounded transition-all duration-150 ${
                    dueDays === o.days ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'
                  }`}
                >{o.label}</button>
              ))}
            </div>
          </div>

          {upcomingDues.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-ink-4 text-xs">Sin vencimientos en este período</div>
          ) : (
            <ScrollFade>
              {(upcomingDues as UpcomingDue[]).map(d => {
                const until = daysUntil(d.dueDate);
                const isToday = until === 'Hoy';
                const isTomorrow = until === 'Mañana';
                return (
                  <div key={d.id} className="flex items-start gap-3 py-2.5 border-b border-line last:border-0">
                    <div className={`shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                      isToday ? 'bg-danger/15 text-danger-text' :
                      isTomorrow ? 'bg-warn/15 text-warn-text' :
                      'bg-card-2 text-ink-4'
                    }`}>{until}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{d.customerName}</p>
                      {d.description && <p className="text-[11px] text-ink-4 truncate">{d.description}</p>}
                    </div>
                    <p className="text-xs font-semibold text-ink num shrink-0">{formatCOP(Number(d.amount))}</p>
                  </div>
                );
              })}
            </ScrollFade>
          )}
        </Card>

        {/* Right: risk clients */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <SectionLabel>Clientes en riesgo</SectionLabel>
            <span className="text-[11px] text-ink-4">+60 días sin pago</span>
          </div>

          {riskClients.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-success-text text-xs">Sin clientes en riesgo</div>
          ) : (
            <ScrollFade>
              {riskClients.map((d, i) => {
                const days = d.lastPaymentDate ? daysSince(d.lastPaymentDate as string | null) : null;
                return (
                  <div key={d.id} className="flex items-center gap-2 py-2.5 border-b border-line last:border-0">
                    <span className="text-[11px] font-mono text-ink-4 w-4 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{d.name}</p>
                      <p className="text-[11px] text-ink-4">
                        {days === null ? 'Sin pagos registrados' : `${days}d sin pago`}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-danger-text num shrink-0">{formatCOP(d.pendingBalance)}</p>
                  </div>
                );
              })}
            </ScrollFade>
          )}
        </Card>
      </div>

      {/* Notes + write-offs summary */}
      {(pendingNotes.length > 0 || writeOffs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">

          {pendingNotes.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Notas de crédito sin aplicar</SectionLabel>
                <span className="text-xs font-semibold text-warn-text num">{formatCOP(pendingNotesAmt)}</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pendingNotes.map(n => (
                  <div key={n.id} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{n.customerName}</p>
                      <p className="text-[11px] text-ink-4 truncate">{n.reason}</p>
                    </div>
                    <p className="text-xs font-semibold text-ink num shrink-0">{formatCOP(Number(n.amount))}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {writeOffs.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Castigos del año</SectionLabel>
                <span className="text-xs font-semibold text-danger-text num">{formatCOP(writeOffsAmt)}</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {writeOffs.map(w => (
                  <div key={w.id} className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{w.customerName}</p>
                      <p className="text-[11px] text-ink-4 truncate">{w.reason} · {fmtDate(w.writeOffDate)}</p>
                    </div>
                    <p className="text-xs font-semibold text-ink num shrink-0">{formatCOP(Number(w.amount))}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

    </div>
  );
}
