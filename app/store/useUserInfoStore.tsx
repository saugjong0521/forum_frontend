import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserInfoState {
  username: string;
  email: string;
  nickname: string;
  id: number;
  setUserInfo: (userInfo: Partial<Omit<UserInfoState, 'setUserInfo'>>) => void;
  clearUserInfo: () => void;
}

const useUserInfoStore = create<UserInfoState>()(
  persist(
    (set) => ({
      username: '',
      email: '',
      nickname: '',
      id: 0,
      setUserInfo: (userInfo) => set((prev) => ({ ...prev, ...userInfo })),
      clearUserInfo: () => set({ username: '', email: '', nickname: '', id: 0 }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useUserInfoStore };
