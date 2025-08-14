'use client';

import { useState, useEffect } from 'react';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { PATH } from '../constants/path';
import { api } from '../api';

interface Post {
  id: number;
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

interface GetPostsParams {
  skip?: number;
  limit?: number;
  board_id?: number;
}

export const useBringPost = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const bringPosts = async (params: GetPostsParams = {}): Promise<Post[] | null> => {
    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 10,
      board_id: params.board_id || 0
    };

    try {
      const response = await api.get(PATH.GETPOST, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시글을 가져오는데 실패했습니다.';
      setError(errorMessage);
      console.error('게시글 조회 오류:', err);
      setPosts([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    posts,
    bringPosts,
    loading,
    error,
  };
};