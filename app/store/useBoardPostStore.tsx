import { create } from 'zustand';

interface Post {
  post_id: number;
  author_id: number;
  currentBoardId: number | null;
  title: string;
  view_count: number;
  like_count: number;
  is_active: boolean;
  password: string;
  created_at: string;
  updated_at: string;
}

interface BoardState {
  // 게시판 설정
  currentBoardId: number | null; // integer지만 optional이므로 null 허용
  postsPerPage: number;
  
  // 페이지네이션
  currentPage: number;
  hasNextPage: boolean;
  
  // 정렬 설정
  sortBy: string;
  sortOrder: string;
  
  // 게시글 데이터
  posts: Post[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setBoardId: (boardId: number | null) => void; // number 또는 null
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 정렬 Actions
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: string) => void;
  setSorting: (sortBy: string, sortOrder: string) => void;
  
  // 페이지 이동
  goToNextPage: () => void;
  goToPrevPage: () => void;
  
  // 초기화
  resetBoard: () => void;
}

export const useBoardPostStore = create<BoardState>((set, get) => ({
  // 초기 상태
  currentBoardId: null, // null로 기본값 설정 (board_id 없음)
  postsPerPage: 10,
  currentPage: 1,
  hasNextPage: false,
  
  // 정렬 기본값
  sortBy: 'created_at',
  sortOrder: 'desc',
  
  posts: [],
  loading: false,
  error: null,
  
  // Actions
  setBoardId: (boardId) => set({ 
    currentBoardId: boardId, 
    currentPage: 1 // board 변경시 페이지 초기화
  }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setPosts: (posts) => set({ posts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // 정렬 Actions
  setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }), // 정렬 변경시 페이지 초기화
  setSortOrder: (sortOrder) => set({ sortOrder, currentPage: 1 }),
  setSorting: (sortBy, sortOrder) => set({ 
    sortBy, 
    sortOrder, 
    currentPage: 1 // 정렬 변경시 페이지 초기화
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
    // 정렬은 초기화하지 않음 (사용자 설정 유지)
  }),
}));