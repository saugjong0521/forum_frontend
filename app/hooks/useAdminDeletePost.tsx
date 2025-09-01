import { useState, useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';

interface DeletePostType {
  post_id: number;
}

const useAdminDeletePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const deletePost = useCallback(async (params: DeletePostType) => {
    setLoading(true);
    setError(null);

    // 유효성 검사
    if (!params.post_id) {
      setError('게시글 ID가 필요합니다.');
      setLoading(false);
      return false;
    }

    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return false;
    }

    try {
      console.log('게시글 삭제 요청:', {
        post_id: params.post_id,
        token: !!token
      });

      // DELETE 메소드 사용
      const response = await api.delete(PATH.ADMINDELETEPOST(params.post_id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('게시글 삭제 성공:', response.data);
      return true;
      
    } catch (err: any) {
      let errorMessage = '게시글 삭제에 실패했습니다.';

      if (err.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '게시글 삭제 권한이 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '게시글을 찾을 수 없습니다.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }

      setError(errorMessage);
      console.error('게시글 삭제 오류:', err);
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
    deletePost,
    loading,
    error,
    clearError,
  };
};

export default useAdminDeletePost;