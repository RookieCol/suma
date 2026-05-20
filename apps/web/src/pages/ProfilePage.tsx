import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../api/auth';
import { Card, SectionLabel } from '../components/ui/Card';
import { useAuthStore } from '../store/auth.store';

type Status = { ok: boolean; msg: string } | null;

export function ProfilePage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // ── Telegram ──────────────────────────────────────────
  const [telegramId, setTelegramId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<Status>(null);

  useEffect(() => {
    if (profile?.telegramId) setTelegramId(profile.telegramId);
  }, [profile?.telegramId]);

  const telegramMutation = useMutation({
    mutationFn: (tid: string | null) => updateProfile({ telegramId: tid }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setTelegramStatus({ ok: true, msg: 'ID de Telegram guardado.' });
      setTimeout(() => setTelegramStatus(null), 3000);
    },
    onError: (e: Error) => setTelegramStatus({ ok: false, msg: e.message }),
  });

  function handleSaveTelegram(e: React.FormEvent) {
    e.preventDefault();
    setTelegramStatus(null);
    const val = telegramId.trim() || null;
    if (val && !/^\d+$/.test(val)) {
      setTelegramStatus({ ok: false, msg: 'El ID debe ser solo números.' });
      return;
    }
    telegramMutation.mutate(val);
  }

  // ── Password ──────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState<Status>(null);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.next.length < 8) {
      setPwStatus({ ok: false, msg: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus({ ok: false, msg: 'Las contraseñas no coinciden.' });
      return;
    }
    setPwLoading(true);
    const err = await changePassword(pwForm.current, pwForm.next);
    setPwLoading(false);
    if (err) {
      setPwStatus({ ok: false, msg: err });
    } else {
      setPwForm({ current: '', next: '', confirm: '' });
      setPwStatus({ ok: true, msg: 'Contraseña actualizada correctamente.' });
      setTimeout(() => setPwStatus(null), 4000);
    }
  }

  const inputCls = 'border border-line-2 rounded-md px-3 py-2 text-sm text-ink bg-card placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition w-full';

  return (
    <div className="flex flex-col gap-4 max-w-lg">

      {/* Identity */}
      <Card>
        <SectionLabel>Cuenta</SectionLabel>
        <div className="mt-3 space-y-1.5">
          <p className="text-sm font-semibold text-ink">{user?.name}</p>
          <p className="text-xs text-ink-3">{user?.email}</p>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-card-2 text-ink-4 border border-line capitalize">{user?.role}</span>
        </div>
      </Card>

      {/* Telegram */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="size-4 text-ink-3 shrink-0" />
          <SectionLabel>Telegram</SectionLabel>
        </div>

        <p className="text-xs text-ink-3 mb-4 leading-relaxed">
          Vincula tu cuenta al bot para registrar cobros directamente desde Telegram.
          Para obtener tu ID numérico, escríbele a{' '}
          <span className="font-mono text-ink-2">@userinfobot</span> en Telegram.
        </p>

        <form onSubmit={handleSaveTelegram} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej. 123456789"
            value={telegramId}
            onChange={e => setTelegramId(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={telegramMutation.isPending}
            className="shrink-0 px-4 py-2 text-sm font-semibold bg-ink hover:bg-ink-2 text-white rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {telegramMutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>

        {telegramId && profile?.telegramId === telegramId && (
          <p className="mt-2 text-xs text-success-text flex items-center gap-1">
            <CheckCircle2 className="size-3 shrink-0" /> Vinculado
          </p>
        )}

        <StatusMsg status={telegramStatus} />
      </Card>

      {/* Password */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="size-4 text-ink-3 shrink-0" />
          <SectionLabel>Cambiar contraseña</SectionLabel>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-4 mb-1.5">Contraseña actual</label>
            <input
              type="password"
              autoComplete="current-password"
              value={pwForm.current}
              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-4 mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pwForm.next}
              onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-4 mb-1.5">Confirmar nueva contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              className={inputCls}
            />
          </div>

          <StatusMsg status={pwStatus} />

          <button
            type="submit"
            disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="w-full px-4 py-2 text-sm font-semibold bg-ink hover:bg-ink-2 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {pwLoading ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </Card>

    </div>
  );
}

function StatusMsg({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p className={`mt-2 text-xs flex items-center gap-1.5 ${status.ok ? 'text-success-text' : 'text-danger-text'}`}>
      {status.ok
        ? <CheckCircle2 className="size-3 shrink-0" />
        : <AlertCircle className="size-3 shrink-0" />
      }
      {status.msg}
    </p>
  );
}
