'use client';

import { useState } from 'react';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { PATH } from '../constants/path';
import { api } from '../api';

interface UploadPostParams {
  title: string;
  content: string;
  password: string;
  board_id?: number; // 선택적으로 만들고 기본값 사용
}

interface UploadPostRequest {
  title: string;
  content: string;
  board_id: number;
  password: string;
}

interface UploadPostResponse {
  id: number;
  author_id: number;
  board_id: number;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  is_active: boolean;
  password: string;
  created_at: string;
  updated_at: string;
}

export const useUploadPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const uploadPost = async (params: UploadPostParams): Promise<UploadPostResponse | null> => {
    setLoading(true);
    setError(null);

    // 훅에서 postData 객체 생성
    const postData: UploadPostRequest = {
      title: params.title.trim(),
      content: params.content,
      board_id: params.board_id || 0, // 기본값 0
      password: params.password.trim()
    };

    try {
      const response = await api.post(PATH.UPLOADPOST, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시글 작성에 실패했습니다.';
      setError(errorMessage);
      console.error('게시글 작성 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadPost,
    loading,
    error,
  };
};