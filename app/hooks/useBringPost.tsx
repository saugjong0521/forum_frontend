import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { usePostStore } from '../store/usePostStore';

interface GetPostParams {
    post_id: number;    // 필수
    password?: number;  // 선택사항
    forceRefresh?: boolean; // 강제 새로고침
}

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
        const { forceRefresh = false } = params;
        
        // 캐시된 데이터가 있고 강제 새로고침이 아니며 같은 게시글이고 만료되지 않았다면 return
        if (!forceRefresh && 
            post && 
            post.post_id === params.post_id && 
            !shouldRefetch()) {
            console.log('useBringPost: 캐시된 데이터 사용');
            return post;
        }

        setLoading(true);
        setError(null);

        try {
            // GET 요청으로 통일, password는 쿼리 파라미터로 전송
            const queryParams: any = {};
            if (params.password !== undefined) {
                queryParams.password = params.password;
            }

            console.log('useBringPost API 호출:', {
                post_id: params.post_id,
                queryParams,
                forceRefresh,
                캐시상태: {
                    기존_post_id: post?.post_id,
                    shouldRefetch: shouldRefetch(),
                }
            });

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
    }, [post, shouldRefetch, setPost, setLoading, setError, token]);

    // 강제 새로고침 함수
    const refreshPost = useCallback(async (postId: number, password?: number) => {
        return await bringPost({ post_id: postId, password, forceRefresh: true });
    }, [bringPost]);

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
        refreshPost,
        resetPost,
    };
};

export default useBringPost;