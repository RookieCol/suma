import { useState } from 'react';
import { useCustomers } from '../hooks/useDashboard';
import { EditPanel } from '../components/panels/EditPanel';
import { PaymentPanel } from '../components/panels/PaymentPanel';
import { ProfileView } from '../components/panels/ProfileView';
import { Card, CardHeader, SectionLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { EditTarget } from '../components/panels/EditPanel';
import type { Customer, Debt } from '@suma/types';

type PaymentTarget = Pick<Debt, 'id' | 'name' | 'company' | 'pendingBalance'>;

export function CustomersPage() {
  const [search, setSearch]             = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editTarget, setEditTarget]     = useState<EditTarget | null>(null);
  const [profileId, setProfileId]       = useState<string | null>(null);
  const [profileName, setProfileName]   = useState<string | undefined>();
  const [paymentDebt, setPaymentDebt]   = useState<PaymentTarget | null>(null);

  const { data: customers = [], isLoading } = useCustomers();

  const q = search.toLowerCase();
  const filtered = customers.filter(c => {
    if (!showInactive && !c.active) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.neighborhood ?? '').toLowerCase().includes(q)
    );
  });

  function openProfile(c: Customer) { setProfileId(c.id); setProfileName(c.name); }
  function openEdit(c: Customer) { setEditTarget({ mode: 'edit', customer: c }); }

  if (profileId) {
    return (
      <>
        <ProfileView customerId={profileId} customerName={profileName} onBack={() => setProfileId(null)} onPayment={d => setPaymentDebt(d)} />
        <PaymentPanel debt={paymentDebt} onClose={() => setPaymentDebt(null)} />
      </>
    );
  }

  return (
    <>
      <Card noPad>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <SectionLabel>Clientes</SectionLabel>
            <span className="text-xs text-ink-4 font-mono num">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente…"
              className="border border-line-2 rounded-md px-3 py-2 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent w-full sm:w-48 transition"
            />
            <button
              onClick={() => setShowInactive(v => !v)}
              className={`text-xs font-semibold border rounded-md px-3 py-2 transition-colors whitespace-nowrap ${
                showInactive
                  ? 'bg-ink text-white border-ink'
                  : 'border-line-2 text-ink-2 hover:border-ink-4 bg-card'
              }`}
            >
              {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
            </button>
            <button
              onClick={() => setEditTarget({ mode: 'create' })}
              className="text-xs font-semibold bg-ink hover:bg-ink-2 text-white rounded-md px-3.5 py-2 transition-colors whitespace-nowrap"
            >
              + Nuevo cliente
            </button>
          </div>
        </CardHeader>

        {isLoading && (
          <div className="flex items-center justify-center h-40 text-ink-4 text-sm">
            <span className="animate-spin mr-2 text-base">↻</span> Cargando…
          </div>
        )}

        {!isLoading && (
          <>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-line">
              {filtered.length === 0 && (
                <p className="px-5 py-10 text-center text-ink-4 text-sm">Sin resultados</p>
              )}
              {filtered.map(c => (
                <div key={c.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => openProfile(c)} className="text-sm font-semibold text-ink hover:text-accent text-left transition-colors">
                        {c.name}
                      </button>
                      {!c.active && <Badge variant="red">Inactivo</Badge>}
                    </div>
                    {c.company      && <p className="text-xs text-ink-3 mt-0.5">{c.company}</p>}
                    {c.phone        && <p className="text-xs text-ink-3 font-mono mt-0.5">{c.phone}</p>}
                    {c.neighborhood && <p className="text-xs text-ink-3 mt-0.5">{c.neighborhood}</p>}
                  </div>
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs font-semibold border border-line-2 hover:border-ink-4 text-ink-2 hover:text-ink rounded-md px-3 py-1.5 transition-colors shrink-0 bg-card"
                  >
                    Editar
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
                  <th className="px-5 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Barrio</th>
                  <th className="px-5 py-3">Estado</th>
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
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-2">{c.company ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-2 font-mono hidden md:table-cell">{c.phone ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-2 hidden lg:table-cell">{c.neighborhood ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.active ? 'emerald' : 'red'}>{c.active ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs font-semibold border border-line-2 hover:border-ink-4 text-ink-2 hover:text-ink rounded-md px-3 py-1.5 transition-colors bg-card"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t border-line bg-card-2">
                    <td colSpan={5} className="px-5 py-3 text-right text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em]">Total</td>
                    <td colSpan={2} className="px-5 py-3 text-sm text-ink-2">
                      <span className="font-mono num font-semibold">{customers.filter(c => c.active).length}</span> activos
                      {' · '}
                      <span className="font-mono num font-semibold">{customers.length}</span> total
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </>
        )}
      </Card>

      <EditPanel target={editTarget} onClose={() => setEditTarget(null)} />
    </>
  );
}
