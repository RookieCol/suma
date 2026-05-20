import { useState } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useActivity, useDebts, useSummary, useTrend } from '../hooks/useDashboard';
import { Card, SectionLabel } from '../components/ui/Card';
import { formatCOP } from '../lib/formatters';
import type { TrendPoint } from '@suma/types';

const PERIOD_OPTIONS = [
  { days: 1,  label: 'Hoy'    },
  { days: 7,  label: '7 días' },
  { days: 30, label: '30 días'},
];

const COLOR_CARTERA = 'oklch(9.4% 0 0)';
const COLOR_COBRADO = 'oklch(50% 0.18 148)';

function fmtCOP(v: number) {
  if (v === 0) return '0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}
function fmtDay(day: string) {
  return new Date(day + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}
const axisStyle = {
  tick: { fontSize: 10, fill: 'oklch(72% 0 0)' },
  axisLine: false as const, tickLine: false as const,
};
function BarTip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return <div className="bg-card border border-line rounded-md px-3 py-2 shadow-tooltip text-xs font-semibold text-ink">{formatCOP(payload[0].value)}</div>;
}
function LineTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-line rounded-md px-3 py-2 shadow-tooltip text-xs space-y-1">
      {label && <p className="text-ink-3 mb-1.5">{fmtDay(label)}</p>}
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

export function CollectionReport() {
  const [period, setPeriod] = useState(7);

  const { data: summary }        = useSummary();
  const { data: trend = [] }     = useTrend();
  const { data: activity }       = useActivity(period);
  const { data: debts = [] }     = useDebts();

  const rawTrend   = trend.map((t: TrendPoint) => ({ day: t.day, total: t.total }));
  const trendTotal = rawTrend.reduce((s, d) => s + d.total, 0);
  const dso        = trendTotal > 0 ? Math.round((summary?.totalPortfolio ?? 0) / (trendTotal / 30)) : 0;
  const totalDebt  = debts.reduce((s, d) => s + d.totalDebt, 0);
  const totalPaid  = debts.reduce((s, d) => s + d.totalPaid, 0);
  const collRate   = totalDebt > 0 ? Math.round(totalPaid / totalDebt * 100) : 0;

  const portfolioStart = (summary?.totalPortfolio ?? 0) + trendTotal;
  let cumulative = 0;
  const chartData = rawTrend.map(d => {
    cumulative += d.total;
    return { day: d.day, Cobrado: cumulative, Cartera: portfolioStart - cumulative };
  });

  const methodsData = (activity?.byMethod ?? []).slice().sort((a, b) => b.total - a.total)
    .map(m => ({ name: m.method, value: m.total }));
  const periodLabel = PERIOD_OPTIONS.find(o => o.days === period)?.label ?? '';

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">

      {/* Period selector */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-ink-3">Actividad del período</p>
        <div className="inline-flex items-center bg-card-2 border border-line rounded-md p-0.5">
          {PERIOD_OPTIONS.map(o => (
            <button key={o.days} onClick={() => setPeriod(o.days)}
              className={`text-xs font-medium px-2.5 py-1 rounded transition-all duration-150 ${
                period === o.days ? 'bg-card text-ink shadow-card' : 'text-ink-3 hover:text-ink'
              }`}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Cobrado',  value: formatCOP(activity?.totalCollected ?? 0), sub: periodLabel.toLowerCase() },
          { label: 'Cobros',   value: String(activity?.paymentsCount ?? 0),     sub: 'transacciones' },
          { label: 'Clientes', value: String(activity?.customersVisited ?? 0),  sub: 'atendidos' },
          {
            label: 'DSO',
            value: dso > 0 ? `${dso}d` : '—',
            sub: 'días promedio de cobro',
            cls: dso > 90 ? 'text-danger-text' : dso > 60 ? 'text-warn-text' : dso > 0 ? 'text-success-text' : undefined,
          },
        ].map(k => (
          <Card key={k.label}>
            <SectionLabel>{k.label}</SectionLabel>
            <p className={`text-2xl font-semibold num leading-none tracking-tight mt-3 ${k.cls ?? 'text-ink'}`}>{k.value}</p>
            <p className="text-xs text-ink-3 mt-2">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Main grid: trend chart + methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">

        {/* Left: tasa + trend */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Tasa de recaudo */}
          <Card className="shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <SectionLabel>Tasa de recaudo histórica</SectionLabel>
                <p className="text-[11px] text-ink-4 mt-0.5">total pagado ÷ total facturado</p>
              </div>
              <p className={`text-3xl font-semibold num leading-none ${collRate >= 70 ? 'text-success-text' : collRate >= 40 ? 'text-warn-text' : 'text-danger-text'}`}>
                {collRate}%
              </p>
            </div>
            <div className="h-1.5 rounded-full bg-card-2 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${collRate}%`,
                background: collRate >= 70 ? 'oklch(50% 0.18 148)' : collRate >= 40 ? 'oklch(68% 0.18 85)' : 'oklch(50% 0.22 25)',
              }} />
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-ink-4 num">
              <span>{formatCOP(totalPaid)} cobrado</span>
              <span>{formatCOP(totalDebt)} facturado</span>
            </div>
          </Card>

          {/* Dual-line trend */}
          <Card className="flex flex-col flex-1 min-h-0">
            <div className="flex items-start justify-between mb-3 shrink-0">
              <div>
                <SectionLabel>Cartera vs. cobrado</SectionLabel>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full shrink-0" style={{ background: COLOR_CARTERA }} />
                    <span className="text-[11px] text-ink-4">Cartera</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full shrink-0" style={{ background: COLOR_COBRADO }} />
                    <span className="text-[11px] text-ink-4">Cobrado</span>
                  </div>
                </div>
              </div>
              {trendTotal > 0 && (
                <p className="text-sm font-semibold num shrink-0" style={{ color: COLOR_COBRADO }}>
                  {formatCOP(trendTotal)} <span className="text-[11px] text-ink-4 font-normal">30d</span>
                </p>
              )}
            </div>
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-ink-4 text-xs">Sin datos</div>
            ) : (
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0 0)" vertical={false} />
                    <XAxis dataKey="day" tickFormatter={fmtDay} {...axisStyle} interval="preserveStartEnd" />
                    <YAxis tickFormatter={fmtCOP} {...axisStyle} width={52} />
                    <RechartsTooltip content={<LineTip />} cursor={{ stroke: 'oklch(84% 0 0)', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="Cartera" name="Cartera" stroke={COLOR_CARTERA} strokeWidth={1.5} dot={false}
                      activeDot={{ r: 3, fill: COLOR_CARTERA, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="Cobrado" name="Cobrado" stroke={COLOR_COBRADO} strokeWidth={1.5} dot={false}
                      activeDot={{ r: 3, fill: COLOR_COBRADO, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Right: methods chart */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-baseline justify-between mb-3 shrink-0">
            <SectionLabel>Por método de pago</SectionLabel>
            <span className="text-xs text-ink-4 lowercase">{periodLabel}</span>
          </div>
          {methodsData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-ink-4 text-xs">Sin cobros en este período</div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodsData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0 0)" horizontal={false} />
                  <XAxis type="number" tickFormatter={fmtCOP} {...axisStyle} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'oklch(58% 0 0)' }} axisLine={false} tickLine={false} width={88} />
                  <RechartsTooltip content={<BarTip />} cursor={{ fill: 'oklch(96.8% 0 0)' }} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} fill="oklch(9.4% 0 0)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
