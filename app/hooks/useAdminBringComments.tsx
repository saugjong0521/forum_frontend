import { useState, useCallback } from 'react';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { PATH } from '../constants/path';
import { Comment } from '../types/board';

const useAdminBringComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const fetchComments = useCallback(async (postId: number) => {
    if (!postId) {
      setError('게시글 ID가 필요합니다.');
      return;
    }

    if (!token) {
      setError('관리자 로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(PATH.ADMINGETCOMMENTS(postId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments(response.data || []);
    } catch (err: any) {
      let errorMessage = '댓글을 불러오는데 실패했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '관리자 인증이 필요합니다.';
      } else if (err.response?.status === 403) {
        errorMessage = '댓글 조회 권한이 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '게시글을 찾을 수 없습니다.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      console.error('댓글 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refetch = useCallback(async (postId: number) => {
    await fetchComments(postId);
  }, [fetchComments]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    comments,
    loading,
    error,
    fetchComments,
    refetch,
    clearError,
  };
};

export default useAdminBringComments;