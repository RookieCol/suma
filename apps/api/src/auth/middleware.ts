import type { MiddlewareHandler } from 'hono';
import { auth } from './auth';

export type AppRole = 'admin' | 'vendedor' | 'contabilidad';

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'No autorizado' }, 401);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (c as any).set('authUser', session.user);
  await next();
};

export function requireRole(...roles: AppRole[]): MiddlewareHandler {
  return async (c, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (c as any).get('authUser') as { role?: string | null } | undefined;
    if (!user) return c.json({ error: 'No autorizado' }, 401);
    if (roles.length && !roles.includes(user.role as AppRole)) {
      return c.json({ error: 'Sin permisos suficientes' }, 403);
    }
    await next();
  };
}
