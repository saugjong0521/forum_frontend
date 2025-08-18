import { useState, useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';

interface GetPostParams {
    post_id: number;    // 필수
    password?: number;  // 선택사항
}

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

const useBringPost = () => {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useSessionTokenStore();

    const bringPost = useCallback(async (params: GetPostParams) => {
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
            let errorMessage = '게시글을 가져오는데 실패했습니다.';
            
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
    }, [token]);

    // 상태 초기화 함수
    const resetPost = useCallback(() => {
        setPost(null);
        setError(null);
        setLoading(false);
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