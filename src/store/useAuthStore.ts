import { create } from 'zustand';
import { hashPassword } from '../utils/crypto.ts';

interface AuthState {
  isAuthenticated: boolean;
  password: string; // kept in memory only for encryption, never persisted
  isFirstSetup: boolean;
  error: string;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  setupPassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  password: '',
  isFirstSetup: !localStorage.getItem('integral_pw_hash'),
  error: '',

  login: async (password: string) => {
    const storedHash = localStorage.getItem('integral_pw_hash');
    if (!storedHash) {
      set({ error: 'Kein Passwort gesetzt. Bitte zuerst einrichten.' });
      return false;
    }
    const hash = await hashPassword(password);
    if (hash === storedHash) {
      set({ isAuthenticated: true, password, error: '' });
      return true;
    }
    set({ error: 'Falsches Passwort.' });
    return false;
  },

  logout: () => set({ isAuthenticated: false, password: '' }),

  setupPassword: async (password: string) => {
    const hash = await hashPassword(password);
    localStorage.setItem('integral_pw_hash', hash);
    set({ isAuthenticated: true, password, isFirstSetup: false, error: '' });
  },
}));
