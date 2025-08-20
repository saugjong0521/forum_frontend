// hooks/useBringComments.ts
import { useState, useEffect } from 'react';
import { usePostStore } from '../store/usePostStore';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { api } from '../api';
import { PATH } from '../constants/path';
import { Comment } from '../types/board';

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
    const [lastFetchedPostId, setLastFetchedPostId] = useState<number | null>(null);
    
    const { post } = usePostStore();
    const { token } = useSessionTokenStore();

    const fetchComments = async () => {
        if (!post?.post_id) {
            setError('게시글 ID가 없습니다.');
            return;
        }
        if (!token) {
            setError('로그인이 필요합니다.');
            return;
        }

        // 중복 호출 방지
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(PATH.GETCOMMENTS(post.post_id), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setComments(response.data || []);
            setLastFetchedPostId(post.post_id);
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

    // post.post_id가 변경될 때만 댓글 불러오기 (중복 호출 방지)
    useEffect(() => {
        if (post?.post_id && token && post.post_id !== lastFetchedPostId) {
            fetchComments();
        } else if (!post?.post_id || !token) {
            // post나 token이 없으면 댓글도 초기화
            setComments([]);
            setError(null);
            setLastFetchedPostId(null);
        }
    }, [post?.post_id, token]);

    return {
        comments,
        loading,
        error,
        refetch,
        clearError,
    };
};

export default useBringComments;