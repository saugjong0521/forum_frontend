// store/useCommentStore.ts
import { create } from 'zustand';
import { Comment } from '../types/board';

interface CommentState {
    // 댓글 데이터
    comments: Comment[];
    loading: boolean;
    error: string | null;
    
    // UI 상태
    replyingTo: number | null;
    replyContent: string;
    
    // Actions
    setComments: (comments: Comment[]) => void;
    addComment: (comment: Comment) => void;
    removeComment: (commentId: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    
    // Reply actions
    setReplyingTo: (commentId: number | null) => void;
    setReplyContent: (content: string) => void;
    clearReply: () => void;
    
    // 초기화
    reset: () => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
    // 초기 상태
    comments: [],
    loading: false,
    error: null,
    replyingTo: null,
    replyContent: '',
    
    // Actions
    setComments: (comments) => set({ comments }),
    
    addComment: (comment) => set((state) => ({
        comments: [...state.comments, comment]
    })),
    
    removeComment: (commentId) => set((state) => ({
        comments: state.comments.filter(c => c.comment_id !== commentId)
    })),
    
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
    
    // Reply actions
    setReplyingTo: (commentId) => set({ 
        replyingTo: commentId,
        replyContent: commentId ? get().replyContent : '' 
    }),
    
    setReplyContent: (content) => set({ replyContent: content }),
    
    clearReply: () => set({ 
        replyingTo: null, 
        replyContent: '' 
    }),
    
    // 초기화
    reset: () => set({
        comments: [],
        loading: false,
        error: null,
        replyingTo: null,
        replyContent: '',
    }),
}));