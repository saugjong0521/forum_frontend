import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TokenState {
  token: string;
  setToken: (newToken: string) => void;
  clearToken: () => void;
}

const useSessionTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      token: '',
      setToken: (newToken: string) => set({ token: newToken }),
      clearToken: () => set({ token: '' }),
    }),
    {
      name: 'token-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useSessionTokenStore };
