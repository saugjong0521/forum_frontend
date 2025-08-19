import { useState } from 'react';
import { api } from '../api';
import { PATH } from '../constants/path';
import { useSessionTokenStore } from '../store/useSessionTokenStore';


interface UseHandleRecommendReturn {
    recommendPost: (postId: number) => Promise<boolean>;
    undoRecommend: (postId: number) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

const useHandleRecommend = (): UseHandleRecommendReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useSessionTokenStore();

    const recommendPost = async (postId: number): Promise<boolean> => {
        if (!token) {
            setError('로그인이 필요합니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post(PATH.POSTRECOMMEND(postId), {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return true;
        } catch (err: any) {
            let errorMessage = '추천에 실패했습니다.';

            if (err.response?.status === 401) {
                errorMessage = '로그인이 필요합니다.';
            } else if (err.response?.status === 403) {
                errorMessage = '추천 권한이 없습니다.';
            } else if (err.response?.status === 404) {
                errorMessage = '게시글을 찾을 수 없습니다.';
            } else if (err.response?.status === 409) {
                errorMessage = '이미 추천한 게시글입니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            console.error('게시글 추천 실패:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const undoRecommend = async (postId: number): Promise<boolean> => {
        if (!token) {
            setError('로그인이 필요합니다.');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.delete(PATH.UNDORECOMMEND(postId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return true;
        } catch (err: any) {
            let errorMessage = '추천 해제에 실패했습니다.';

            if (err.response?.status === 401) {
                errorMessage = '로그인이 필요합니다.';
            } else if (err.response?.status === 403) {
                errorMessage = '추천 해제 권한이 없습니다.';
            } else if (err.response?.status === 404) {
                errorMessage = '게시글을 찾을 수 없거나 추천하지 않은 게시글입니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            console.error('게시글 추천 해제 실패:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        recommendPost,
        undoRecommend,
        loading,
        error,
        clearError,
    };
};

export default useHandleRecommend;