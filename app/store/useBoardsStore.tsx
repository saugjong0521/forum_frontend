import { create } from 'zustand';
import { Board } from '../types/board';


interface BoardsNameState {
  // 게시판 목록 데이터
  boards: Board[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // 마지막 fetch 시간
  
  // Actions
  setBoards: (boards: Board[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (timestamp: number) => void;
  
  // 유틸리티 함수들
  getBoardById: (id: number) => Board | undefined;
  getBoardName: (id: number | null) => string;  
  
  // 초기화
  reset: () => void;
}

export const useBoardsStore = create<BoardsNameState>((set, get) => ({
  // 초기 상태
  boards: [],
  loading: false,
  error: null,
  lastFetched: null,
  
  // Actions
  setBoards: (boards) => set({ 
    boards,
    lastFetched: Date.now()
  }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastFetched: (timestamp) => set({ lastFetched: timestamp }),
  
  // 유틸리티 함수들
  getBoardById: (id) => {
    const { boards } = get();
    return boards.find(board => board.board_id === id);
  },
  
  getBoardName: (id) => {
    if (id === null) return '전체 게시판';
    const { boards } = get();
    const board = boards.find(board => board.board_id === id);
    return board ? board.name : '게시판';
  },

  
  // 초기화
  reset: () => set({
    boards: [],
    loading: false,
    error: null,
    lastFetched: null,
  }),
}));