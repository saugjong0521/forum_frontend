import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useBoardPostStore } from '../store/useBoardPostStore';
import { GetBoardParams } from '../types/board';

export const useBringBoardPost = () => {
  const {
    posts,
    loading,
    error,
    currentBoardId,
    postsPerPage,
    sortBy,
    sortOrder,
    setPosts,
    setLoading,
    setError,
    setHasNextPage,
  } = useBoardPostStore();

  const bringboard = useCallback(async (params: GetBoardParams = {}) => {
    setLoading(true);
    setError(null);

    const queryParams: GetBoardParams = {
      skip: params.skip || 0,
      limit: params.limit || postsPerPage,
      board_id: params.board_id || currentBoardId,
      sort_by: params.sort_by || sortBy,
      sort_order: params.sort_order || sortOrder,
      // 일반 사용자용은 항상 활성 게시글만 조회
      is_active: true
    };

    try {
      console.log('🔍 일반 사용자 API 요청 파라미터:', queryParams);

      const response = await api.get(PATH.GETBOARD, {
        params: queryParams,
      });

      const fetchedPosts = response.data;
      
      // 추가 보안: 클라이언트에서도 is_active: true인 게시글만 필터링
      const activePosts = fetchedPosts.filter((post: any) => post.is_active === true);
      
      setPosts(activePosts);

      // 다음 페이지가 있는지 확인
      const requestedLimit = queryParams.limit || postsPerPage;
      const hasMore = fetchedPosts.length === requestedLimit;

      if (hasMore) {
        try {
          const nextPageResponse = await api.get(PATH.GETBOARD, {
            params: {
              ...queryParams,
              skip: (queryParams.skip || 0) + requestedLimit,
              limit: 1
            },
          });
          setHasNextPage(nextPageResponse.data.length > 0);
        } catch {
          setHasNextPage(false);
        }
      } else {
        setHasNextPage(false);
      }

      console.log('✅ 일반 사용자 게시글 조회 완료:', {
        전체응답: fetchedPosts.length,
        활성게시글: activePosts.length,
        다음페이지: hasMore
      });

      return activePosts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시글을 가져오는데 실패했습니다.';
      setError(errorMessage);
      console.error('게시글 조회 오류:', err);
      setPosts([]);
      setHasNextPage(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentBoardId, postsPerPage, sortBy, sortOrder, setPosts, setLoading, setError, setHasNextPage]);

  return {
    posts,
    bringboard,
    loading,
    error,
  };
};