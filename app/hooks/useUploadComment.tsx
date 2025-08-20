// hooks/useUploadComment.ts
import { useState } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { Comment, UploadCommentType } from '../types/board';


const useUploadComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

  const uploadComment = async (params: UploadCommentType): Promise<Comment | null> => {
    setLoading(true);
    setError(null);

    // 유효성 검사
    if (!params.content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      setLoading(false);
      return null;
    }

    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return null;
    }

    try {
      const commentData = {
        content: params.content.trim(),
        parent_id: params.parent_id || 0, // 일반 댓글은 0, 대댓글은 부모 댓글 ID
      };

      const response = await api.post(PATH.UPLOADCOMMENT(params.post_id), commentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data; // Comment 타입으로 반환
    } catch (err: any) {
      let errorMessage = '댓글 작성에 실패했습니다.';

      if (err.response?.status === 401) {
        errorMessage = '로그인이 필요합니다.';
      } else if (err.response?.status === 403) {
        errorMessage = '댓글 작성 권한이 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '게시글을 찾을 수 없습니다.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      console.error('댓글 작성 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploadComment,
    loading,
    error,
    clearError,
  };
};

export default useUploadComment;