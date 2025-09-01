import { useState } from 'react';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { api } from '../api';
import { PATH } from '../constants/path';

interface UseDeleteCommentReturn {
    deleteComment: (commentId: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

const useAdminDeleteComment = (): UseDeleteCommentReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useSessionTokenStore();

    const deleteComment = async (commentId: number): Promise<boolean> => {
        if (!token) {
            setError('로그인이 필요합니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.delete(PATH.ADMINDELETECOMMENT(commentId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return true;
        } catch (err: any) {
            let errorMessage = '댓글 삭제에 실패했습니다.';

            if (err.response?.status === 401) {
                errorMessage = '로그인이 필요합니다.';
            } else if (err.response?.status === 403) {
                errorMessage = '댓글을 삭제할 권한이 없습니다.';
            } else if (err.response?.status === 404) {
                errorMessage = '댓글을 찾을 수 없습니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            console.error('댓글 삭제 실패:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        deleteComment,
        loading,
        error,
        clearError,
    };
};

export default useAdminDeleteComment;