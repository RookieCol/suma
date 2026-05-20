import {
  BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { useAging, useDebts } from '../hooks/useDashboard';
import { Card, SectionLabel } from '../components/ui/Card';
import { ScrollFade } from '../components/ui/ScrollFade';
import { formatCOP } from '../lib/formatters';
import type { Aging } from '@suma/types';

const AGING_COLORS: Record<string, string> = {
  '0-30':  'oklch(50% 0.18 148)',
  '31-60': 'oklch(68% 0.18 85)',
  '61-90': 'oklch(62% 0.20 50)',
  '90+':   'oklch(50% 0.22 25)',
};
const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  mayorista: 'Mayorista', confeccionista: 'Confeccionista',
  retail: 'Retail', gobierno: 'Gobierno', otro: 'Otro',
};

function fmtCOP(v: number) {
  if (v === 0) return '0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}
const axisStyle = {
  tick: { fontSize: 10, fill: 'oklch(72% 0 0)' },
  axisLine: false as const, tickLine: false as const,
};
function Tip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-line rounded-md px-3 py-2 shadow-tooltip text-xs">
      {label && <p className="text-ink-3 mb-1">{label}d</p>}
      <p className="font-semibold text-ink">{formatCOP(payload[0].value)}</p>
    </div>
  );
}

export function PortfolioReport() {
  const { data: aging = [] } = useAging();
  const { data: debts = [] } = useDebts();

  const totalPortfolio = aging.reduce((s, b: Aging) => s + b.amount, 0);
  const currentAmt      = aging.find((b: Aging) => b.bucket === '0-30')?.amount ?? 0;
  const currentPct      = totalPortfolio > 0 ? Math.round(currentAmt / totalPortfolio * 100) : 0;
  const overdueAmt   = aging.filter((b: Aging) => b.bucket !== '0-30').reduce((s, b) => s + b.amount, 0);
  const overduePct   = totalPortfolio > 0 ? Math.round(overdueAmt / totalPortfolio * 100) : 0;
  const agingData    = aging.map((b: Aging) => ({ name: b.bucket, value: b.amount, customers: b.customers }));

  const sorted       = [...debts].filter(d => d.pendingBalance > 0).sort((a, b) => b.pendingBalance - a.pendingBalance);
  const totalPending = sorted.reduce((s, d) => s + d.pendingBalance, 0);
  const top5Amt      = sorted.slice(0, 5).reduce((s, d) => s + d.pendingBalance, 0);
  const top10Amt     = sorted.slice(0, 10).reduce((s, d) => s + d.pendingBalance, 0);
  const top5Pct      = totalPending > 0 ? Math.round(top5Amt  / totalPending * 100) : 0;
  const top610Pct    = totalPending > 0 ? Math.round((top10Amt - top5Amt) / totalPending * 100) : 0;
  const restoPct     = 100 - top5Pct - top610Pct;
  const highConc     = (top5Pct + top610Pct) > 60;

  const byTypeMap = new Map<string, number>();
  const byZoneMap = new Map<string, number>();
  for (const d of debts) {
    if (d.pendingBalance <= 0) continue;
    const tk = d.customerType ?? 'sin_tipo';
    byTypeMap.set(tk, (byTypeMap.get(tk) ?? 0) + d.pendingBalance);
    const zk = d.zone ?? 'sin_zona';
    byZoneMap.set(zk, (byZoneMap.get(zk) ?? 0) + d.pendingBalance);
  }
  const byTypeData = [...byTypeMap.entries()].sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ name: CUSTOMER_TYPE_LABELS[k] ?? 'Sin clasificar', value: v }));
  const byZoneData = [...byZoneMap.entries()].sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ name: k === 'sin_zona' ? 'Sin zona' : k, value: v }));
  const hasTypeData = byTypeData.some(d => d.name !== 'Sin clasificar');
  const hasZoneData = byZoneData.some(d => d.name !== 'Sin zona');
  const hasSegments = hasTypeData || hasZoneData;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Cartera total',     value: formatCOP(totalPortfolio), sub: `${sorted.length} clientes` },
          { label: 'Vencida',           value: formatCOP(overdueAmt),   sub: 'en todos los buckets' },
          { label: '% Cartera sana',    value: `${currentPct}%`,  sub: `${formatCOP(currentAmt)} al corriente`,
            cls: currentPct >= 70 ? 'text-success-text' : currentPct >= 50 ? 'text-warn-text' : 'text-danger-text' },
          { label: '% Cartera vencida', value: `${overduePct}%`, sub: `${formatCOP(overdueAmt)}`,
            cls: overduePct > 30 ? 'text-danger-text' : overduePct > 15 ? 'text-tang-text' : 'text-warn-text' },
        ].map(k => (
          <Card key={k.label}>
            <SectionLabel>{k.label}</SectionLabel>
            <p className={`text-2xl font-semibold num leading-none tracking-tight mt-3 ${k.cls ?? 'text-ink'}`}>{k.value}</p>
            <p className="text-xs text-ink-3 num mt-2">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Main grid: aging + concentration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">

        {/* Aging */}
        <Card className="flex flex-col min-h-0">
          <div className="mb-3 shrink-0"><SectionLabel>Cartera por antigüedad</SectionLabel></div>
          {agingData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-ink-4 text-xs">Sin datos</div>
          ) : (
            <>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="32%">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0 0)" vertical={false} />
                    <XAxis dataKey="name" tickFormatter={v => `${v}d`} {...axisStyle} />
                    <YAxis tickFormatter={fmtCOP} {...axisStyle} width={52} />
                    <RechartsTooltip content={<Tip />} cursor={{ fill: 'oklch(96.8% 0 0)' }} />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {agingData.map(e => <Cell key={e.name} fill={AGING_COLORS[e.name] ?? 'oklch(72% 0 0)'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 shrink-0">
                {agingData.map(b => (
                  <div key={b.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: AGING_COLORS[b.name] ?? 'oklch(72% 0 0)' }} />
                    <span className="text-ink-4 font-mono">{b.name}d</span>
                    <span className="font-medium text-ink-2 num">{b.customers}c</span>
                    <span className="text-ink-4 num">· {formatCOP(b.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Concentration */}
        <Card className="flex flex-col min-h-0">
          <div className="flex items-start justify-between mb-4 shrink-0">
            <SectionLabel>Concentración de riesgo</SectionLabel>
            {highConc && (
              <div className="flex items-center gap-1 text-[11px] text-danger-text">
                <AlertTriangle className="size-3 shrink-0" />
                Top 10 &gt;60%
              </div>
            )}
          </div>

          <div className="flex rounded-md overflow-hidden h-5 mb-5 shrink-0">
            {top5Pct > 0 && (
              <div className="flex items-center justify-center text-[10px] font-mono text-white"
                style={{ width: `${top5Pct}%`, background: 'oklch(50% 0.22 25)' }}>
                {top5Pct > 6 ? `${top5Pct}%` : ''}
              </div>
            )}
            {top610Pct > 0 && (
              <div className="flex items-center justify-center text-[10px] font-mono text-white"
                style={{ width: `${top610Pct}%`, background: 'oklch(62% 0.20 50)' }}>
                {top610Pct > 6 ? `${top610Pct}%` : ''}
              </div>
            )}
            {restoPct > 0 && (
              <div className="flex items-center justify-center text-[10px] font-mono text-white"
                style={{ width: `${restoPct}%`, background: 'oklch(50% 0.18 148)' }}>
                {restoPct > 6 ? `${restoPct}%` : ''}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              { label: 'Top 5',    pct: top5Pct,   amt: top5Amt,                 color: 'oklch(50% 0.22 25)',  n: Math.min(5, sorted.length) },
              { label: 'C. 6–10',  pct: top610Pct, amt: top10Amt - top5Amt,       color: 'oklch(62% 0.20 50)',  n: Math.min(10, sorted.length) - Math.min(5, sorted.length) },
              { label: 'Resto',    pct: restoPct,  amt: totalPending - top10Amt,  color: 'oklch(50% 0.18 148)', n: Math.max(0, sorted.length - 10) },
            ].map(seg => (
              <div key={seg.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                  <span className="text-[11px] text-ink-4">{seg.label}</span>
                </div>
                <p className="text-lg font-semibold text-ink num leading-none">{seg.pct}%</p>
                <p className="text-[11px] text-ink-3 num">{formatCOP(seg.amt)}</p>
                <p className="text-[11px] text-ink-4 num">{seg.n} clientes</p>
              </div>
            ))}
          </div>

          {/* Top debtors list fills remaining space */}
          {sorted.length > 0 && (
            <ScrollFade className="mt-4 border-t border-line">
              {sorted.slice(0, 10).map((d, i) => (
                <div key={d.id} className="flex items-center gap-2 py-2 border-b border-line last:border-0">
                  <span className="text-[11px] font-mono text-ink-4 w-4 shrink-0 text-right">{i + 1}</span>
                  <p className="flex-1 text-xs font-medium text-ink truncate">{d.name}</p>
                  <p className="text-xs font-semibold text-ink num shrink-0">{formatCOP(d.pendingBalance)}</p>
                </div>
              ))}
            </ScrollFade>
          )}
        </Card>
      </div>

      {/* Segmentation charts — only when data exists */}
      {hasSegments && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
          {hasTypeData && (
            <Card>
              <div className="mb-3"><SectionLabel>Por tipo de cliente</SectionLabel></div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTypeData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0 0)" horizontal={false} />
                    <XAxis type="number" tickFormatter={fmtCOP} {...axisStyle} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'oklch(58% 0 0)' }} axisLine={false} tickLine={false} width={104} />
                    <RechartsTooltip content={<Tip />} cursor={{ fill: 'oklch(96.8% 0 0)' }} />
                    <Bar dataKey="value" radius={[0, 2, 2, 0]} fill="oklch(9.4% 0 0)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
          {hasZoneData && (
            <Card>
              <div className="mb-3"><SectionLabel>Por zona</SectionLabel></div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byZoneData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(91% 0 0)" horizontal={false} />
                    <XAxis type="number" tickFormatter={fmtCOP} {...axisStyle} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'oklch(58% 0 0)' }} axisLine={false} tickLine={false} width={72} />
                    <RechartsTooltip content={<Tip />} cursor={{ fill: 'oklch(96.8% 0 0)' }} />
                    <Bar dataKey="value" radius={[0, 2, 2, 0]} fill="oklch(50% 0.18 148)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}

    </div>
  );
}
