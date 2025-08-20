// hooks/useBringPost.ts
import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { usePostStore } from '../store/usePostStore';
import { GetPostParams } from '../types/board';

const useBringPost = () => {
    const {
        post,
        loading,
        error,
        setPost,
        setLoading,
        setError,
        shouldRefetch,
    } = usePostStore();
    
    const { token } = useSessionTokenStore();

    const bringPost = useCallback(async (params: GetPostParams) => {
        // 토큰이 없으면 에러 처리
        if (!token) {
            setError('게시물을 보기 위해선 로그인이 필요합니다.');
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // GET 요청으로 통일, password는 쿼리 파라미터로 전송
            const queryParams: any = {};
            if (params.password !== undefined) {
                queryParams.password = params.password;
            }

            const response = await api.get(PATH.GETPOST(params.post_id), {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPost(response.data);
            return response.data;
        } catch (err: any) {
            let errorMessage = '게시물을 보기 위해선 로그인이 필요합니다.';
            
            if (err.response?.status === 403) {
                errorMessage = 'PASSWORD_REQUIRED'; // 컴포넌트에서 구분할 수 있도록
            } else if (err.response?.status === 404) {
                errorMessage = '게시글을 찾을 수 없습니다.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            console.error('게시글 조회 오류:', err);
            setPost(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [setPost, setLoading, setError, token]);

    // 상태 초기화 함수
    const resetPost = useCallback(() => {
        const { reset } = usePostStore.getState();
        reset();
    }, []);

    return {
        post,
        loading,
        error,
        bringPost,
        resetPost,
    };
};

export default useBringPost;