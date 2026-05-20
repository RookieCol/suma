import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signIn, getSession } from '../api/auth';
import { useAuthStore } from '../store/auth.store';

export function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const { setToken, setUser }   = useAuthStore();
  const navigate = useNavigate();

  async function handleLogin() {
    setError(false);
    setLoading(true);
    try {
      const token = await signIn(email, password);
      if (!token) { setError(true); return; }
      setToken(token);
      const session = await getSession();
      if (session?.user) setUser(session.user);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas font-sans px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-ink-3 uppercase tracking-[0.12em]">Suma</span>
          </div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Iniciar sesión</h1>
          <p className="text-sm text-ink-3 mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Card form */}
        <div className="bg-card border border-line rounded-lg shadow-card p-5 space-y-3">
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                className="w-full border border-line-2 rounded-md px-3 py-2 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink-2 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-line-2 rounded-md px-3 py-2 text-sm text-ink placeholder-ink-4 bg-card focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink-2 transition"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-ink hover:bg-ink-2 disabled:opacity-50 text-white rounded-md py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Entrando…' : 'Continuar'}
          </button>

          {error && (
            <p className="text-danger-text text-xs text-center">Credenciales incorrectas. Intenta de nuevo.</p>
          )}
        </div>

      </div>
    </div>
  );
}
