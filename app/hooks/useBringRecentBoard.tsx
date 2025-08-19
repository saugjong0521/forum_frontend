import { useState, useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';

interface Post {
  post_id: number;
  author_id: number;
  board_id: number;
  title: string;
  view_count: number;
  like_count: number;
  is_active: boolean;
  password: string;
  created_at: string;
  updated_at: string;
}

interface GetSideBoardParams {
  skip?: number;
  limit?: number;
  board_id?: number | null;
  sort_by?: string;
  sort_order?: string;
}

export const useBringRecentBoard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bringSideBoard = useCallback(async (params: GetSideBoardParams = {}) => {
    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 5, // 사이드용 기본값
      sort_by: params.sort_by || 'created_at',
      sort_order: params.sort_order || 'desc',
      // board_id가 null이 아닐 때만 포함
      ...(params.board_id !== null && params.board_id !== undefined && { board_id: params.board_id })
    };

    console.log('useBringSideBoard API 호출:', {
      입력_params: params,
      최종_queryParams: queryParams
    });

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