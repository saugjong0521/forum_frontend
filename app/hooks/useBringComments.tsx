import { useState, useEffect } from 'react';
import { usePostStore } from '../store/usePostStore';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { api } from '../api';
import { PATH } from '../constants/path';


interface Author {
    id: number;
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

interface UseBringCommentsReturn {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearError: () => void;
}



const useBringComments = (): UseBringCommentsReturn => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Zustand store에서 post 정보와 토큰 가져오기
    const { post } = usePostStore();
    const { token } = useSessionTokenStore();

    const fetchComments = async () => {
        if (!post?.id) {
            setError('게시글 ID가 없습니다.');
            return;
        }

        if (!token) {
            setError('로그인이 필요합니다.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(PATH.GETCOMMENTS(post.id), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setComments(response.data);
        } catch (err: any) {
            let errorMessage = '댓글을 불러오는데 실패했습니다.';

            if (err.response?.status === 401) {
                errorMessage = '로그인이 필요합니다.';
            } else if (err.response?.status === 403) {
                errorMessage = '댓글을 볼 권한이 없습니다.';
            } else if (err.response?.status === 404) {
                errorMessage = '게시글을 찾을 수 없습니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            console.error('댓글 불러오기 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        await fetchComments();
    };

    const clearError = () => {
        setError(null);
    };

    // post.id가 변경될 때마다 댓글 불러오기
    useEffect(() => {
        if (post?.id && token) {
            fetchComments();
        } else {
            // post나 token이 없으면 댓글도 초기화
            setComments([]);
            setError(null);
        }
    }, [post?.id, token]);

    return {
        comments,
        loading,
        error,
        refetch,
        clearError,
    };
};

export default useBringComments;