// store/useUserInfoStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserType } from '../types/user';

interface UserInfoState extends UserType {
  setUserInfo: (userInfo: Partial<UserType>) => void;
  clearUserInfo: () => void;
}

const useUserInfoStore = create<UserInfoState>()(
  persist(
    (set) => ({
      // User 필드들
      username: '',
      email: '',
      nickname: '',
      user_id: 0,
      is_active: false,
      is_admin: false,
      created_at: '',
      updated_at: '',
      
      // 액션들
      setUserInfo: (userInfo: Partial<UserType>) => set((prev) => ({ ...prev, ...userInfo })),
      clearUserInfo: () => set({ 
        username: '', 
        email: '', 
        nickname: '', 
        user_id: 0,
        is_active: false,
        is_admin: false,
        created_at: '',
        updated_at: ''
      }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export { useUserInfoStore };