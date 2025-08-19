import { create } from 'zustand';

interface Author {
    user_id: number;
    username: string;
    nickname: string;
    created_at: string;
}

interface Comment {
    content: string;
    parent_id: number;
    id: number;
    post_id: number;
    author_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: Author;
    children: string[];
}

interface Post {
    title: string;
    content: string;
    board_id: number;
    password: string;
    id: number;
    author_id: number;
    view_count: number;
    like_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: Author;
    comments: Comment[];
}

interface PostState {
    // 게시글 데이터
    post: Post | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null; // 마지막 fetch 시간
    
    // Actions
    setPost: (post: Post | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setLastFetched: (timestamp: number) => void;
    
    // 유틸리티 함수들
    isMyPost: (userId: number | null) => boolean;
    shouldRefetch: (maxAgeMinutes?: number) => boolean;
    
    // 초기화
    reset: () => void;
}

export const usePostStore = create<PostState>((set, get) => ({
    // 초기 상태
    post: null,
    loading: false,
    error: null,
    lastFetched: null,
    
    // Actions
    setPost: (post) => set({ 
        post,
        lastFetched: post ? Date.now() : null
    }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setLastFetched: (timestamp) => set({ lastFetched: timestamp }),
    
    // 유틸리티 함수들
    isMyPost: (userId) => {
        const { post } = get();
        return post && userId ? post.author_id === userId : false;
    },
    
    shouldRefetch: (maxAgeMinutes = 10) => { // 게시글은 10분 캐시
        const { lastFetched } = get();
        if (!lastFetched) return true;
        
        // 개발 환경에서는 캐시 시간을 더 짧게
        const isDev = process.env.NODE_ENV === 'development';
        const effectiveMaxAge = isDev ? 1 : maxAgeMinutes; // 개발: 1분, 운영: 10분
        
        const maxAge = effectiveMaxAge * 60 * 1000;
        const age = Date.now() - lastFetched;
        return age > maxAge;
    },
    
    // 초기화
    reset: () => set({
        post: null,
        loading: false,
        error: null,
        lastFetched: null,
    }),
}));