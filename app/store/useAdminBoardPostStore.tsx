// store/useAdminBoardPostStore.ts
import { create } from 'zustand';
import { BoardPostsState, Post } from '../types/board';

// is_active 필터 타입 정의
type IsActiveFilter = boolean | null; // true(활성), false(비활성), null(전체)

interface AdminBoardPostState extends BoardPostsState {
  // is_active 필터 추가
  isActiveFilter: IsActiveFilter;
}

interface AdminBoardPostActions {
  // 기본 Actions
  setBoardId: (boardId: number | null) => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 페이지당 게시글 수 설정
  setPostsPerPage: (postsPerPage: number) => void;
  
  // 정렬 Actions
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: string) => void;
  setSorting: (sortBy: string, sortOrder: string) => void;
  
  // is_active 필터 Actions
  setIsActiveFilter: (isActive: IsActiveFilter) => void;
  
  // 페이지 이동
  goToNextPage: () => void;
  goToPrevPage: () => void;
  
  // 초기화
  resetBoard: () => void;
}

type AdminBoardStore = AdminBoardPostState & AdminBoardPostActions;

export const useAdminBoardPostStore = create<AdminBoardStore>((set, get) => ({
  // 초기 상태 - 관리자용은 20개로 설정
  currentBoardId: null,
  postsPerPage: 20,
  currentPage: 1,
  hasNextPage: false,
  
  // 정렬 기본값
  sortBy: 'created_at',
  sortOrder: 'desc',
  
  // is_active 필터 기본값 (null = 전체)
  isActiveFilter: null,
  
  posts: [],
  loading: false,
  error: null,
  
  // Actions
  setBoardId: (boardId) => set({
    currentBoardId: boardId,
    currentPage: 1
  }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  
  setPosts: (posts) => set({ posts }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  // 페이지당 게시글 수 설정 (페이지를 1로 리셋)
  setPostsPerPage: (postsPerPage) => set({
    postsPerPage,
    currentPage: 1
  }),
  
  // 정렬 Actions
  setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),
  
  setSortOrder: (sortOrder) => set({ sortOrder, currentPage: 1 }),
  
  setSorting: (sortBy, sortOrder) => set({
    sortBy,
    sortOrder,
    currentPage: 1
  }),
  
  // is_active 필터 Action (페이지를 1로 리셋)
  setIsActiveFilter: (isActiveFilter) => set({
    isActiveFilter,
    currentPage: 1
  }),
  
  // 페이지 이동
  goToNextPage: () => {
    const { currentPage, hasNextPage } = get();
    if (hasNextPage) {
      set({ currentPage: currentPage + 1 });
    }
  },
  
  goToPrevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
  
  // 초기화
  resetBoard: () => set({
    currentPage: 1,
    hasNextPage: false,
    posts: [],
    loading: false,
    error: null,
    // is_active 필터는 초기화하지 않음 (사용자 선택 유지)
  }),
}));