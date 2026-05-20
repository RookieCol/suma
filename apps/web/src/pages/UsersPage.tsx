import { useState } from 'react';
import { useUsers, useAdminCreateUser, useSetUserRole, useRemoveUser } from '../hooks/useDashboard';
import { useAuthStore } from '../store/auth.store';
import { Card, CardHeader, SectionLabel } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { UserRole, AdminUser } from '@suma/types';

const ROLES: UserRole[] = ['admin', 'vendedor', 'contabilidad'];

const ROLE_LABELS: Record<UserRole, string> = {
  admin:        'Admin',
  vendedor:     'Vendedor',
  contabilidad: 'Contabilidad',
};

const ROLE_VARIANT: Record<UserRole, 'default' | 'emerald' | 'amber'> = {
  admin:        'default',
  vendedor:     'emerald',
  contabilidad: 'amber',
};

type CreateForm = { name: string; email: string; password: string; role: UserRole };
const EMPTY_FORM: CreateForm = { name: '', email: '', password: '', role: 'vendedor' };

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const inputCls = 'w-full border border-line-2 rounded-md px-3.5 py-2.5 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition';
const labelCls = 'block text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em] mb-1.5';

export function UsersPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState<CreateForm>(EMPTY_FORM);
  const [copied, setCopied]         = useState<string | null>(null);
  const [newCreds, setNewCreds]     = useState<{ email: string; password: string } | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ userId: string; role: UserRole } | null>(null);

  const currentUser = useAuthStore(s => s.user);
  const { data: users = [], isLoading } = useUsers();
  const createMut = useAdminCreateUser();
  const roleMut   = useSetUserRole();
  const removeMut = useRemoveUser();

  function openCreate() {
    setForm({ ...EMPTY_FORM, password: generatePassword() });
    setNewCreds(null);
    createMut.reset();
    setShowCreate(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createMut.mutateAsync(form);
    setNewCreds({ email: form.email, password: form.password });
    setForm(EMPTY_FORM);
  }

  async function handleRoleChange(user: AdminUser, newRole: UserRole) {
    if (newRole === user.role) return;
    setRoleTarget({ userId: user.id, role: newRole });
    await roleMut.mutateAsync({ userId: user.id, role: newRole });
    setRoleTarget(null);
  }

  async function handleRemove(user: AdminUser) {
    if (!confirm(`¿Eliminar al usuario "${user.name}" (${user.email})? Esta acción no se puede deshacer.`)) return;
    await removeMut.mutateAsync(user.id);
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      <div className="space-y-4">
        <Card noPad>
          <CardHeader className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2.5">
              <SectionLabel>Usuarios del sistema</SectionLabel>
              <span className="text-xs text-ink-4 font-mono num">{users.length}</span>
            </div>
            <button
              onClick={openCreate}
              className="text-xs font-semibold bg-ink hover:bg-ink-2 text-white rounded-md px-3.5 py-2 transition-colors whitespace-nowrap"
            >
              + Nuevo usuario
            </button>
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
                {users.length === 0 && <p className="px-5 py-10 text-center text-ink-4 text-sm">Sin usuarios</p>}
                {users.map(u => (
                  <div key={u.id} className="px-5 py-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-ink">{u.name}</span>
                          {u.role && <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABELS[u.role]}</Badge>}
                          {u.banned && <Badge variant="red">Bloqueado</Badge>}
                          {u.id === currentUser?.id && <Badge variant="default">Tú</Badge>}
                        </div>
                        <p className="text-xs text-ink-3 font-mono mt-0.5">{u.email}</p>
                      </div>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleRemove(u)}
                          disabled={removeMut.isPending}
                          className="text-xs text-ink-4 hover:text-danger transition-colors disabled:opacity-40 shrink-0"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    {u.id !== currentUser?.id && (
                      <div className="flex gap-1.5 flex-wrap">
                        {ROLES.map(r => (
                          <button
                            key={r}
                            onClick={() => handleRoleChange(u, r)}
                            disabled={roleMut.isPending && roleTarget?.userId === u.id}
                            className={`text-xs font-semibold border rounded-md px-2.5 py-1 transition-colors ${
                              u.role === r
                                ? 'bg-ink text-white border-ink'
                                : 'border-line-2 text-ink-2 hover:border-ink-4 bg-card'
                            }`}
                          >
                            {ROLE_LABELS[r]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <table className="hidden sm:table w-full">
                <thead className="bg-card-2 border-b border-line">
                  <tr className="text-left text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em]">
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-4 text-sm">Sin usuarios</td></tr>
                  )}
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-card-2/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="text-[9px] font-semibold text-ink-4 border border-line-2 rounded-md px-1.5 py-0.5 uppercase tracking-wide">Tú</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-2 font-mono">{u.email}</td>
                      <td className="px-5 py-3.5">
                        {u.id === currentUser?.id ? (
                          u.role && <Badge variant={ROLE_VARIANT[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                        ) : (
                          <div className="flex gap-1.5">
                            {ROLES.map(r => (
                              <button
                                key={r}
                                onClick={() => handleRoleChange(u, r)}
                                disabled={roleMut.isPending && roleTarget?.userId === u.id}
                                className={`text-xs font-semibold border rounded-md px-2.5 py-1 transition-colors disabled:opacity-40 ${
                                  u.role === r
                                    ? 'bg-ink text-white border-ink'
                                    : 'border-line-2 text-ink-2 hover:border-ink-4 bg-card'
                                }`}
                              >
                                {ROLE_LABELS[r]}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.banned
                          ? <Badge variant="red">Bloqueado</Badge>
                          : <Badge variant="emerald">Activo</Badge>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleRemove(u)}
                            disabled={removeMut.isPending}
                            className="text-xs font-medium text-ink-4 hover:text-danger transition-colors disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Card>
      </div>

      {/* Create user panel */}
      <div
        onClick={() => setShowCreate(false)}
        className={`fixed inset-0 bg-ink/25 z-40 backdrop-blur-[2px] transition-opacity duration-200 ${showCreate ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-card flex flex-col border-l border-line z-50 transition-transform duration-200 shadow-panel ${showCreate ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Nuevo usuario</p>
          <button onClick={() => setShowCreate(false)} className="text-ink-4 hover:text-ink transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 thin-scroll">
          {newCreds ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-2">Usuario creado. Comparte estas credenciales de forma segura — la contraseña no se podrá recuperar.</p>
              <div className="space-y-2">
                {([['Email', newCreds.email, 'email'], ['Contraseña', newCreds.password, 'pass']] as const).map(([label, value, key]) => (
                  <div key={key} className="bg-card-2 border border-line rounded-md p-3.5">
                    <p className={labelCls}>{label}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-mono text-ink break-all">{value}</span>
                      <button
                        onClick={() => copyText(value, key)}
                        className="text-xs font-semibold border border-line-2 hover:border-ink-4 text-ink-2 hover:text-ink rounded-md px-2.5 py-1 transition-colors shrink-0 bg-card"
                      >
                        {copied === key ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowCreate(false); setNewCreds(null); }}
                className="w-full border border-line-2 hover:border-ink-4 text-ink-2 hover:text-ink rounded-md py-2.5 text-sm font-medium transition-colors bg-card"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {([
                { key: 'name'  as const, label: 'Nombre completo', type: 'text'  },
                { key: 'email' as const, label: 'Email',            type: 'email' },
              ]).map(f => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}

              <div>
                <label className={labelCls}>Contraseña generada</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className={`${inputCls} flex-1 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, password: generatePassword() }))}
                    className="text-xs font-semibold border border-line-2 hover:border-ink-4 text-ink-2 hover:text-ink rounded-md px-3 transition-colors whitespace-nowrap bg-card"
                  >
                    Nueva
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Rol</label>
                <div className="flex gap-1.5">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, role: r }))}
                      className={`text-xs font-semibold border rounded-md px-3 py-2 transition-colors flex-1 ${
                        form.role === r
                          ? 'bg-ink text-white border-ink'
                          : 'border-line-2 text-ink-2 hover:border-ink-4 bg-card'
                      }`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={createMut.isPending}
                className="w-full bg-ink hover:bg-ink-2 disabled:opacity-50 text-white rounded-md py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                {createMut.isPending && <span className="animate-spin text-base leading-none">↻</span>}
                {createMut.isPending ? 'Creando…' : 'Crear usuario'}
              </button>

              {createMut.error && (
                <p className="text-danger-text text-xs text-center">{createMut.error.message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
