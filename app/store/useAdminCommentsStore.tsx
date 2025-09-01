// store/useAdminCommentsStore.ts
import { create } from 'zustand';
import { Comment } from '../types/board';

// is_active 필터 타입 정의
type IsActiveFilter = boolean | null; // true(활성), false(비활성), null(전체)

interface AdminCommentsState {
  // 기본 상태
  comments: Comment[];
  loading: boolean;
  error: string | null;
  
  // 필터링 상태
  currentSkip: number;
  currentLimit: number;
  currentPage: number;
  hasNextPage: boolean;
  isActiveFilter: IsActiveFilter;
  currentPostId: number | null;
  
  // 페이지네이션
  totalCount: number;
}

interface AdminCommentsActions {
  // 기본 Actions
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (commentId: number, updates: Partial<Comment>) => void;
  removeComment: (commentId: number) => void;
  
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
  setCurrentPostId: (postId: number | null) => void;
  
  // 페이지네이션 정보 Actions
  setTotalCount: (count: number) => void;
  
  // 유틸리티
  reset: () => void;
  clearComments: () => void;
}

type AdminCommentsStore = AdminCommentsState & AdminCommentsActions;

export const useAdminCommentsStore = create<AdminCommentsStore>((set, get) => ({
  // 초기 상태
  comments: [],
  loading: false,
  error: null,
  
  // 필터링 초기 상태
  currentSkip: 0,
  currentLimit: 20, // 관리자용은 20개로 기본값 변경
  currentPage: 1,
  hasNextPage: false,
  isActiveFilter: null, // null = 전체, true = 활성, false = 비활성
  currentPostId: null,
  
  // 페이지네이션 초기 상태
  totalCount: 0,
  
  // Actions
  setComments: (comments: Comment[]) => set({ comments }),
  
  addComment: (comment: Comment) => set((state) => ({
    comments: [comment, ...state.comments],
    totalCount: state.totalCount + 1,
  })),
  
  updateComment: (commentId: number, updates: Partial<Comment>) => set((state) => ({
    comments: state.comments.map((comment) =>
      comment.comment_id === commentId ? { ...comment, ...updates } : comment
    ),
  })),
  
  removeComment: (commentId: number) => set((state) => ({
    comments: state.comments.filter((comment) => comment.comment_id !== commentId),
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
  
  setCurrentPostId: (postId: number | null) => set({
    currentPostId: postId,
    currentPage: 1,
    currentSkip: 0
  }),
  
  // 페이지네이션 정보 Actions
  setTotalCount: (count: number) => set({ totalCount: count }),
  
  // 유틸리티
  reset: () => set({
    comments: [],
    loading: false,
    error: null,
    currentSkip: 0,
    currentLimit: 20,
    currentPage: 1,
    hasNextPage: false,
    isActiveFilter: null,
    currentPostId: null,
    totalCount: 0,
  }),
  
  clearComments: () => set({
    comments: [],
    totalCount: 0,
    hasNextPage: false,
  }),
}));