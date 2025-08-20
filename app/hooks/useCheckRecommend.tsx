// hooks/useCheckRecommend.ts
import { useState } from 'react';
import { api } from '../api';
import { PATH } from '../constants/path';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { useRecommendStore } from '../store/useRecommendStore';
import { RecommendState } from '../types/recommend'; // 변경

interface UseCheckRecommendReturn {
    checkRecommend: (postId: number) => Promise<RecommendState | null>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

const useCheckRecommend = (): UseCheckRecommendReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useSessionTokenStore();
    const { setRecommendState } = useRecommendStore();

    const checkRecommend = async (postId: number): Promise<RecommendState | null> => {
        if (!token) {
            setError('로그인이 필요합니다.');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(PATH.CHECKRECOMMEND(postId), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const recommendData: RecommendState = response.data;
            
            // 스토어에 상태 저장
            setRecommendState(postId, recommendData);
            
            return recommendData;
        } catch (err: any) {
            let errorMessage = '추천 상태 확인에 실패했습니다.';

            if (err.response?.status === 401) {
                errorMessage = '로그인이 필요합니다.';
            } else if (err.response?.status === 404) {
                errorMessage = '게시글을 찾을 수 없습니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            console.error('추천 상태 확인 실패:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        checkRecommend,
        loading,
        error,
        clearError,
    };
};

export default useCheckRecommend;