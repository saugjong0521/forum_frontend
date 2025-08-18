import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useBoardStore } from '../store/useBoardStore';

interface GetPostsParams {
  skip?: number;
  limit?: number;
  board_id?: number;
}

export const useBringPost = () => {
  const {
    posts,
    loading,
    error,
    currentBoardId,
    postsPerPage,
    setPosts,
    setLoading,
    setError,
    setHasNextPage,
  } = useBoardStore();

  const bringPosts = useCallback(async (params: GetPostsParams = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || postsPerPage,
      board_id: params.board_id || currentBoardId
    };

    try {
      const response = await api.get(PATH.GETPOST, {
        params: queryParams,
      });

      const fetchedPosts = response.data;
      setPosts(fetchedPosts);

      // 다음 페이지가 있는지 확인
      const requestedLimit = queryParams.limit;
      const hasMore = fetchedPosts.length === requestedLimit;
      
      if (hasMore) {
        try {
          const nextPageResponse = await api.get(PATH.GETPOST, {
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
  }, [currentBoardId, postsPerPage, setPosts, setLoading, setError, setHasNextPage]);

  return {
    posts,
    bringPosts,
    loading,
    error,
  };
};