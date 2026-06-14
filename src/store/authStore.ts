import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      logout: () => set({ user: null, session: null, loading: false }),
    }),
    {
      name: 'rentease-auth-store',
      // Persist the user and session fields only
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
