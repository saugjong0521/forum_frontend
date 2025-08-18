import { create } from 'zustand';

interface Post {
  id: number;
  author_id: number;
  board_id: number;
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
  currentBoardId: number;
  postsPerPage: number;
  
  // 페이지네이션
  currentPage: number;
  hasNextPage: boolean;
  
  // 게시글 데이터
  posts: Post[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setBoardId: (boardId: number) => void;
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 페이지 이동
  goToNextPage: () => void;
  goToPrevPage: () => void;
  
  // 초기화
  resetBoard: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  // 초기 상태
  currentBoardId: 2, // 기본 board_id
  postsPerPage: 10,
  currentPage: 1,
  hasNextPage: false,
  posts: [],
  loading: false,
  error: null,
  
  // Actions
  setBoardId: (boardId) => set({ currentBoardId: boardId, currentPage: 1 }), // board 변경시 페이지 초기화
  setCurrentPage: (page) => set({ currentPage: page }),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  setPosts: (posts) => set({ posts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
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
  }),
}));