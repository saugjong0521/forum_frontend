import { useState, useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { DeactivePostType } from '../types/board';



const useDeactivatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const deactivatePost = useCallback(async (params: DeactivePostType) => {
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
      console.log('게시글 비활성화 요청:', {
        post_id: params.post_id,
        token: !!token
      });

      // Curl 예시와 동일하게 빈 body로 POST 요청
      const response = await api.post(PATH.DEACTIVATEPOST(params.post_id), undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('게시글 비활성화 성공:', response.data);
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
      console.error('게시글 비활성화 오류:', err);
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
    deactivatePost,
    loading,
    error,
    clearError,
  };
};

export default useDeactivatePost;