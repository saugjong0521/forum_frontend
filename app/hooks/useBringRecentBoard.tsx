import { useState, useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { Post, GetBoardParams } from '../types/board';

export const useBringRecentBoard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bringSideBoard = useCallback(async (params: GetBoardParams = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 5,
      sort_by: params.sort_by || 'created_at',
      sort_order: params.sort_order || 'desc',
      ...(params.board_id !== null && params.board_id !== undefined && { board_id: params.board_id })
    };

    try {
      const response = await api.get(PATH.GETBOARD, {
        params: queryParams,
      });

      const fetchedPosts = response.data;
      setPosts(fetchedPosts);
      return fetchedPosts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사이드 게시글을 가져오는데 실패했습니다.';
      setError(errorMessage);
      console.error('사이드 게시글 조회 오류:', err);
      setPosts([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    bringSideBoard,
    loading,
    error,
  };
};