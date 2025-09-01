import { useState, useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';

const useAdminActivateComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const activateComment = useCallback(async (commentId: number) => {
    setLoading(true);
    setError(null);

    // 유효성 검사
    if (!commentId) {
      setError('댓글 ID가 필요합니다.');
      setLoading(false);
      return false;
    }

    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return false;
    }

    try {
      console.log('댓글 활성화 요청:', {
        comment_id: commentId,
        token: !!token
      });

      // POST /admin/comments/{comment_id}/activate
      const response = await api.post(PATH.ADMINACTIVATECOMMENT(commentId), undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('댓글 활성화 성공:', response.data);
      return true;
      
    } catch (err: any) {
      let errorMessage = '댓글 활성화에 실패했습니다.';

      if (err.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '댓글 활성화 권한이 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '댓글을 찾을 수 없습니다.';
      } else if (err.response?.status === 422) {
        errorMessage = '잘못된 요청입니다.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }

      setError(errorMessage);
      console.error('댓글 활성화 오류:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 에러 초기화 함수
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    activateComment,
    loading,
    error,
    clearError,
  };
};

export default useAdminActivateComment;