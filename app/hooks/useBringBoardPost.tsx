import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useBoardPostStore } from '../store/useBoardPostStore';

interface GetBoardParams {
  skip?: number;
  limit?: number;
  board_id?: number;
  sort_by?: string;
  sort_order?: string;
}

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

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || postsPerPage,
      board_id: params.board_id || currentBoardId,
      sort_by: params.sort_by || sortBy,          // store에서 가져온 값 사용
      sort_order: params.sort_order || sortOrder  // store에서 가져온 값 사용
    };

    try {
      const response = await api.get(PATH.GETBOARD, {
        params: queryParams,
      });

      const fetchedPosts = response.data;
      setPosts(fetchedPosts);

      // 다음 페이지가 있는지 확인
      const requestedLimit = queryParams.limit;
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

      return fetchedPosts;
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