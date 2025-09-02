// store/useAdminUserStore.ts
import { create } from 'zustand';

export interface User {
  user_id: number;
  username: string;
  email: string;
  nickname: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

type IsActiveFilter = boolean | null;

interface AdminUserState {
  users: User[];
  loading: boolean;
  error: string | null;
  
  // 필터링 상태
  currentSkip: number;
  currentLimit: number;
  currentPage: number;
  hasNextPage: boolean;
  isActiveFilter: IsActiveFilter;
  
  // 페이지네이션
  totalCount: number;
}

interface AdminUserActions {
  // 기본 Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: number, updates: Partial<User>) => void;
  removeUser: (userId: number) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 페이지네이션 Actions
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  
  // 필터링 Actions
  setCurrentSkip: (skip: number) => void;
  setCurrentLimit: (limit: number) => void;
  setIsActiveFilter: (isActive: IsActiveFilter) => void;
  
  // 페이지네이션 정보 Actions
  setTotalCount: (count: number) => void;
  
  // 유틸리티
  reset: () => void;
  clearUsers: () => void;
}

type AdminUserStore = AdminUserState & AdminUserActions;

export const useAdminUserStore = create<AdminUserStore>((set, get) => ({
  // 초기 상태
  users: [],
  loading: false,
  error: null,
  
  // 필터링 초기 상태
  currentSkip: 0,
  currentLimit: 20,
  currentPage: 1,
  hasNextPage: false,
  isActiveFilter: null,
  
  // 페이지네이션 초기 상태
  totalCount: 0,
  
  // Actions
  setUsers: (users: User[]) => set({ users }),
  
  addUser: (user: User) => set((state) => ({
    users: [user, ...state.users],
    totalCount: state.totalCount + 1,
  })),
  
  updateUser: (userId: number, updates: Partial<User>) => set((state) => ({
    users: state.users.map((user) =>
      user.user_id === userId ? { ...user, ...updates } : user
    ),
  })),
  
  removeUser: (userId: number) => set((state) => ({
    users: state.users.filter((user) => user.user_id !== userId),
    totalCount: Math.max(0, state.totalCount - 1),
  })),
  
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  
  // 페이지네이션 Actions
  setCurrentPage: (page: number) => set({ 
    currentPage: page,
    currentSkip: (page - 1) * get().currentLimit
  }),
  
  setHasNextPage: (hasNext: boolean) => set({ hasNextPage: hasNext }),
  
  goToNextPage: () => {
    const { currentPage, hasNextPage, currentLimit } = get();
    if (hasNextPage) {
      set({ 
        currentPage: currentPage + 1,
        currentSkip: currentPage * currentLimit
      });
    }
  },
  
  goToPrevPage: () => {
    const { currentPage, currentLimit } = get();
    if (currentPage > 1) {
      set({ 
        currentPage: currentPage - 1,
        currentSkip: (currentPage - 2) * currentLimit
      });
    }
  },
  
  // 필터링 Actions (페이지를 1로 리셋)
  setCurrentSkip: (skip: number) => set({ 
    currentSkip: skip,
    currentPage: Math.floor(skip / get().currentLimit) + 1
  }),
  
  setCurrentLimit: (limit: number) => set({
    currentLimit: limit,
    currentPage: 1,
    currentSkip: 0
  }),
  
  setIsActiveFilter: (isActiveFilter: IsActiveFilter) => set({
    isActiveFilter,
    currentPage: 1,
    currentSkip: 0
  }),
  
  // 페이지네이션 정보 Actions
  setTotalCount: (count: number) => set({ totalCount: count }),
  
  // 유틸리티
  reset: () => set({
    users: [],
    loading: false,
    error: null,
    currentSkip: 0,
    currentLimit: 20,
    currentPage: 1,
    hasNextPage: false,
    isActiveFilter: null,
    totalCount: 0,
  }),
  
  clearUsers: () => set({
    users: [],
    totalCount: 0,
    hasNextPage: false,
  }),
}));