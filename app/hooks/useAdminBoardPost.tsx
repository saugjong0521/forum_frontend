// hooks/useAdminBoardPost.tsx (수정된 버전)

import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useAdminBoardPostStore } from '../store/useAdminBoardPostStore';
import { useUserInfoStore } from '@/app/store/useUserInfoStore';
import { GetBoardParams } from '../types/board'; // 업데이트된 타입 사용
import { useSessionTokenStore } from '../store/useSessionTokenStore';

export const useAdminBoardPost = () => {
    const {
        posts,
        loading,
        error,
        currentBoardId,
        postsPerPage,
        sortBy,
        sortOrder,
        isActiveFilter, // 추가된 필터
        setPosts,
        setLoading,
        setError,
        setHasNextPage,
    } = useAdminBoardPostStore();

    const { user_id } = useUserInfoStore();
    const { token } = useSessionTokenStore();

    const bringboard = useCallback(async (params: GetBoardParams = {}) => {
        setLoading(true);
        setError(null);

        const queryParams: GetBoardParams = {
            skip: params.skip || 0,
            limit: params.limit || postsPerPage,
            board_id: params.board_id || currentBoardId,
            sort_by: params.sort_by || sortBy,
            sort_order: params.sort_order || sortOrder,
            // is_active 필터 추가
            ...(params.is_active !== undefined ? { is_active: params.is_active } :
                isActiveFilter !== null ? { is_active: isActiveFilter } : {})
        };

        try {
            console.log('🔍 Admin API 요청 파라미터:', queryParams);

            const response = await api.get(PATH.GETBOARD, {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const fetchedPosts = response.data;
            setPosts(fetchedPosts);

            // 다음 페이지 확인
            const requestedLimit = queryParams.limit || postsPerPage;
            const hasMore = fetchedPosts.length === requestedLimit;

            if (hasMore) {
                try {
                    const nextPageResponse = await api.get(PATH.GETBOARD, {
                        params: {
                            ...queryParams,
                            skip: (queryParams.skip || 0) + requestedLimit,
                            limit: 1
                        }
                    });
                    setHasNextPage(nextPageResponse.data.length > 0);
                } catch {
                    setHasNextPage(false);
                }
            } else {
                setHasNextPage(false);
            }

            console.log('✅ Admin 게시글 조회 완료:', {
                총개수: fetchedPosts.length,
                is_active필터: queryParams.is_active,
                다음페이지: hasMore
            });

            return fetchedPosts;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '게시글을 가져오는데 실패했습니다.';
            setError(errorMessage);
            console.error('❌ Admin 게시글 조회 오류:', err);
            setPosts([]);
            setHasNextPage(false);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentBoardId, postsPerPage, sortBy, sortOrder, isActiveFilter, setPosts, setLoading, setError, setHasNextPage, user_id]);

    return {
        posts,
        bringboard,
        loading,
        error,
    };
};