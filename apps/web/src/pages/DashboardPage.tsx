import {
  LineChart, Line,
  XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Landmark, Banknote, TrendingUp, Info, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSummary, useAging, useDebts, useTrend } from '../hooks/useDashboard';
import { Card, SectionLabel } from '../components/ui/Card';
import { formatCOP } from '../lib/formatters';
import type { TrendPoint } from '@suma/types';

function formatAxisCOP(v: number): string {
  if (v === 0) return '0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function formatAxisDay(day: string): string {
  const d = new Date(day + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function ageCls(days: number | null): string {
  if (days === null) return 'text-ink-4';
  if (days > 90)     return 'text-danger-text';
  if (days > 60)     return 'text-tang-text';
  if (days > 30)     return 'text-warn-text';
  return 'text-success-text';
}

const COLOR_PORTFOLIO = 'oklch(9.4% 0 0)';
const COLOR_COLLECTED = 'oklch(50% 0.18 148)';

function DualLineTip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-line rounded-md px-3 py-2 shadow-tooltip text-xs space-y-1">
      {label && <p className="text-ink-3 mb-1.5">{formatAxisDay(label)}</p>}
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-ink-3">{p.name}</span>
          <span className="font-semibold text-ink ml-auto pl-3">{formatCOP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

const axisStyle = {
  tick: { fontSize: 10, fill: 'oklch(72% 0 0)' },
  axisLine: false as const,
  tickLine: false as const,
};

export function DashboardPage() {
  const { data: summary }    = useSummary();
  const { data: debts = [] } = useDebts();
  const { data: aging = [] } = useAging();
  const { data: trend = [] } = useTrend();

  const totalDebt      = debts.reduce((s, d) => s + d.totalDebt, 0);
  const totalPaid      = debts.reduce((s, d) => s + d.totalPaid, 0);
  const collectionRate = totalDebt > 0 ? Math.round(totalPaid / totalDebt * 100) : 0;

  const totalPortfolio = aging.reduce((s, b) => s + b.amount, 0);

  const currentAmt    = aging.find(b => b.bucket === '0-30')?.amount ?? 0;
  const currentPct    = totalPortfolio > 0 ? Math.round(currentAmt / totalPortfolio * 100) : 0;

  const overdueAmt = aging.filter(b => b.bucket !== '0-30').reduce((s, b) => s + b.amount, 0);
  const overduePct = totalPortfolio > 0 ? Math.round(overdueAmt / totalPortfolio * 100) : 0;

  const topDebts = [...debts]
    .filter(d => d.pendingBalance > 0)
    .sort((a, b) => b.pendingBalance - a.pendingBalance)
    .slice(0, 5);

  const oldestDebts = [...debts]
    .filter(d => d.oldestSaleDate && d.pendingBalance > 0)
    .sort((a, b) => new Date(a.oldestSaleDate!).getTime() - new Date(b.oldestSaleDate!).getTime())
    .slice(0, 5);

  /* ── Dual-line chart data ─────────────────────── */
  const rawTrend   = trend.map((t: TrendPoint) => ({ day: t.day, total: t.total }));
  const trendTotal = rawTrend.reduce((s, d) => s + d.total, 0);
  const dso        = trendTotal > 0 ? Math.round((summary?.totalPortfolio ?? 0) / (trendTotal / 30)) : 0;
  const portfolioStart = (summary?.totalPortfolio ?? 0) + trendTotal;
  let cumulative = 0;
  const chartData = rawTrend.map(d => {
    cumulative += d.total;
    return {
      day: d.day,
      Cobrado: cumulative,
      Cartera: portfolioStart - cumulative,
    };
  });

  const kpis = [
    {
      label: 'Cartera total',
      value: formatCOP(summary?.totalPortfolio),
      sub: `${summary?.customersWithDebt ?? 0} clientes`,
      Icon: Landmark,
      iconCls: 'text-ink-4',
    },
    {
      label: 'Cobrado hoy',
      value: formatCOP(summary?.collectedToday),
      sub: `${summary?.paymentsToday ?? 0} cobros`,
      Icon: Banknote,
      iconCls: 'text-success',
    },
    {
      label: 'DSO',
      value: dso > 0 ? `${dso}d` : '—',
      sub: 'días promedio de cobro',
      Icon: Clock,
      iconCls: dso > 90 ? 'text-danger' : dso > 60 ? 'text-warn' : 'text-success',
      info: `Cartera total ÷ promedio diario cobrado (30d)\nMide en cuántos días se cobraría toda la cartera al ritmo actual. Menos días = mejor.`,
    },
    {
      label: 'Tasa de recaudo',
      value: `${collectionRate}%`,
      sub: 'pagado del total histórico',
      Icon: TrendingUp,
      iconCls: collectionRate >= 70 ? 'text-success' : collectionRate >= 40 ? 'text-warn' : 'text-danger',
      info: `Total pagado ÷ total facturado × 100\n${formatCOP(totalPaid)} pagados de ${formatCOP(totalDebt)} en deuda histórica acumulada.`,
    },
    {
      label: '% Cartera sana',
      value: `${currentPct}%`,
      sub: `${formatCOP(currentAmt)} al corriente (0–30d)`,
      Icon: ShieldCheck,
      iconCls: currentPct >= 70 ? 'text-success' : currentPct >= 50 ? 'text-warn' : 'text-danger',
    },
    {
      label: '% Cartera vencida',
      value: `${overduePct}%`,
      sub: `${formatCOP(overdueAmt)} en todos los buckets`,
      Icon: AlertTriangle,
      iconCls: overduePct > 30 ? 'text-danger' : overduePct > 15 ? 'text-tang' : 'text-warn',
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">

      {/* Dual-line chart — top */}
      <Card className="flex flex-col flex-1 min-h-0 p-5">
        <div className="flex items-start justify-between mb-4 shrink-0">
          <div>
            <SectionLabel>Cartera vs. cobrado — últimos 30 días</SectionLabel>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded-full shrink-0" style={{ background: COLOR_PORTFOLIO }} />
                <span className="text-[11px] text-ink-4">Cartera pendiente</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 rounded-full shrink-0" style={{ background: COLOR_COLLECTED }} />
                <span className="text-[11px] text-ink-4">Cobrado acumulado</span>
              </div>
            </div>
          </div>
          {trendTotal > 0 && (
            <div className="text-right shrink-0">
              <p className="text-[11px] text-ink-4 mb-0.5">Cobrado en 30d</p>
              <p className="text-base font-semibold num leading-none" style={{ color: COLOR_COLLECTED }}>{formatCOP(trendTotal)}</p>
            </div>
          )}
        </div>
        {chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-ink-4 text-xs">Sin datos</div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0 0)" vertical={false} />
                <XAxis dataKey="day" tickFormatter={formatAxisDay} {...axisStyle} interval="preserveStartEnd" />
                <YAxis tickFormatter={formatAxisCOP} {...axisStyle} width={52} />
                <RechartsTooltip content={<DualLineTip />} cursor={{ stroke: 'oklch(84% 0 0)', strokeWidth: 1 }} />
                <Line
                  type="monotone" dataKey="Cartera" name="Cartera"
                  stroke={COLOR_PORTFOLIO} strokeWidth={1.5} dot={false}
                  activeDot={{ r: 3, fill: COLOR_PORTFOLIO, strokeWidth: 0 }}
                />
                <Line
                  type="monotone" dataKey="Cobrado" name="Cobrado"
                  stroke={COLOR_COLLECTED} strokeWidth={1.5} dot={false}
                  activeDot={{ r: 3, fill: COLOR_COLLECTED, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 shrink-0">
        {kpis.map(({ label, value, sub, Icon, iconCls, info }) => (
          <Card key={label}>
            <div className="flex items-start justify-between mb-3">
              <SectionLabel>{label}</SectionLabel>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon className={`size-4 shrink-0 ${iconCls}`} />
                {info && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3 shrink-0 text-ink-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-60 whitespace-pre-line text-xs">
                      {info}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <p className="text-2xl font-semibold text-ink num leading-none tracking-tight">{value}</p>
            <p className="text-xs text-ink-3 num mt-2">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">

        <Card className="flex flex-col p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <SectionLabel>Mayores deudores</SectionLabel>
          </div>
          {topDebts.length === 0 ? (
            <p className="text-xs text-ink-4 p-4">Sin datos</p>
          ) : topDebts.map((d, i) => {
            const days = daysSince(d.lastPaymentDate);
            return (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-0 hover:bg-canvas transition-colors">
                <span className="text-[11px] font-mono text-ink-4 w-4 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink leading-tight truncate">{d.name}</p>
                  {d.neighborhood && (
                    <p className="text-[11px] text-ink-4 truncate leading-tight">{d.neighborhood}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-ink num">{formatCOP(d.pendingBalance)}</p>
                  <p className={`text-[11px] num leading-tight ${ageCls(days)}`}>
                    {days !== null ? `${days}d sin pago` : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>

        <Card className="flex flex-col p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <SectionLabel>Cartera más vieja</SectionLabel>
          </div>
          {oldestDebts.length === 0 ? (
            <p className="text-xs text-ink-4 p-4">Sin datos</p>
          ) : oldestDebts.map((d, i) => {
            const age = daysSince(d.oldestSaleDate);
            return (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-0 hover:bg-canvas transition-colors">
                <span className="text-[11px] font-mono text-ink-4 w-4 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink leading-tight truncate">{d.name}</p>
                  {d.neighborhood && (
                    <p className="text-[11px] text-ink-4 truncate leading-tight">{d.neighborhood}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-ink num">{formatCOP(d.pendingBalance)}</p>
                  <p className={`text-[11px] num leading-tight ${ageCls(age)}`}>
                    {age !== null ? `deuda de ${age}d` : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>

      </div>

    </div>
  );
}
