import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromSession: () => void;
}

const getStoredAuth = () => {
  if (typeof window === 'undefined') return { token: null, user: null };
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  if (!token || !userStr) return { token: null, user: null };
  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialAuth.token,
  user: initialAuth.user,
  isAuthenticated: !!(initialAuth.token && initialAuth.user),
  login: (token, user) => {
    try {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch {}
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    set({ token: null, user: null, isAuthenticated: false });
  },
  loadFromSession: () => {
    const { token, user } = getStoredAuth();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  }
}));
