import { useState, useEffect } from 'react';
import type { Customer } from '@suma/types';
import { useCreateCustomer, useUpdateCustomer, useSetCustomerActive } from '../../hooks/useDashboard';

export type EditTarget =
  | { mode: 'create' }
  | { mode: 'edit'; customer: Customer };

interface Props {
  target: EditTarget | null;
  onClose: () => void;
}

type FormState = {
  name: string; company: string; phone: string;
  address: string; neighborhood: string; notes: string;
};

const EMPTY: FormState = { name: '', company: '', phone: '', address: '', neighborhood: '', notes: '' };

const FIELDS: { key: keyof Omit<FormState, 'notes'>; label: string; required?: boolean }[] = [
  { key: 'name',         label: 'Nombre',    required: true },
  { key: 'company',      label: 'Empresa'                   },
  { key: 'phone',        label: 'Teléfono'                  },
  { key: 'address',      label: 'Dirección'                 },
  { key: 'neighborhood', label: 'Barrio'                    },
];

const labelCls = 'block text-[10.5px] font-semibold text-ink-4 uppercase tracking-[0.12em] mb-1.5';
const inputCls = 'w-full border border-line-2 rounded-md px-3.5 py-2.5 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition';

export function EditPanel({ target, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [ok, setOk]     = useState(false);

  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();
  const activeMut = useSetCustomerActive();

  const isOpen    = target !== null;
  const isEditing = target?.mode === 'edit';
  const customer  = isEditing ? target.customer : null;

  useEffect(() => {
    if (!target) return;
    if (target.mode === 'edit') {
      const c = target.customer;
      setForm({ name: c.name, company: c.company ?? '', phone: c.phone ?? '', address: c.address ?? '', neighborhood: c.neighborhood ?? '', notes: c.notes ?? '' });
    } else {
      setForm(EMPTY);
    }
    setOk(false);
    createMut.reset();
    updateMut.reset();
  }, [target?.mode === 'edit' ? target.customer.id : target?.mode]);

  const saving = createMut.isPending || updateMut.isPending;
  const error  = createMut.error?.message ?? updateMut.error?.message;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name:         form.name.trim(),
      company:      form.company.trim()      || undefined,
      phone:        form.phone.trim()        || undefined,
      address:      form.address.trim()      || undefined,
      neighborhood: form.neighborhood.trim() || undefined,
      notes:        form.notes.trim()        || undefined,
    };
    if (isEditing && customer) {
      await updateMut.mutateAsync({ id: customer.id, data: payload });
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } else {
      await createMut.mutateAsync(payload);
      onClose();
    }
  }

  async function handleToggleActive() {
    if (!customer) return;
    await activeMut.mutateAsync({ id: customer.id, active: !customer.active });
    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/25 z-40 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-card flex flex-col border-l border-line z-50 transition-transform duration-200 shadow-panel ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</p>
          <button onClick={onClose} className="text-ink-4 hover:text-ink transition-colors text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 thin-scroll">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input
                type="text"
                required={f.required}
                placeholder={f.required ? '' : 'Opcional'}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Opcional"
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink hover:bg-ink-2 disabled:opacity-50 text-white rounded-md py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {saving && <span className="animate-spin text-base leading-none">↻</span>}
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear cliente'}
          </button>

          {error && <p className="text-danger-text text-xs text-center">{error}</p>}
          {ok    && <p className="text-success-text text-xs text-center">Cambios guardados</p>}
        </form>

        {isEditing && customer && (
          <div className="px-6 py-4 border-t border-line">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-ink-2">
                  {customer.active ? 'Cliente activo' : 'Cliente inactivo'}
                </p>
                <p className="text-xs text-ink-4 mt-0.5">Los inactivos no aparecen en el bot</p>
              </div>
              <button
                onClick={handleToggleActive}
                disabled={activeMut.isPending}
                className="text-xs font-semibold border border-line-2 hover:border-ink-4 text-ink-2 hover:text-ink rounded-md px-3 py-1.5 transition-colors disabled:opacity-40 bg-card whitespace-nowrap"
              >
                {customer.active ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
