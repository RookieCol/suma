import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@suma/types';

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user:  null,
      setToken: (token) => set({ token }),
      setUser:  (user)  => set({ user }),
      logout:   ()      => set({ token: null, user: null }),
    }),
    { name: 'suma-auth' },
  ),
);
