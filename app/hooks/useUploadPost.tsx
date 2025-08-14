'use client';

import { useState } from 'react';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { PATH } from '../constants/path';
import { api } from '../api';


interface UploadPostRequest {
  title: string;
  content: string;
  board_id: number;
  password: string;
}

interface UploadPostResponse {
  // API 응답 타입을 실제 응답에 맞게 수정하세요
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

  const uploadPost = async (data: UploadPostRequest): Promise<UploadPostResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(PATH.UPLOADPOST, data, {
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