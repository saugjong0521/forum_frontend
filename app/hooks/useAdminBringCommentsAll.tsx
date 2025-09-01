// hooks/useAdminBringComments.ts
import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { Comment } from '../types/board';
import { useAdminCommentsStore } from '../store/useAdminCommentsStore';

export interface GetAdminCommentsParams {
  skip?: number;
  limit?: number;
  is_active?: boolean | null; // null도 허용하도록 수정
  post_id?: number | null;    // null도 허용하도록 수정
}

const useAdminBringCommentsAll = () => {
  const { token } = useSessionTokenStore();
  const {
    comments,
    loading,
    error,
    setComments,
    setLoading,
    setError,
    setHasNextPage, // 추가
  } = useAdminCommentsStore();

  const bringAdminComments = useCallback(async (params: GetAdminCommentsParams = {}) => {
    if (!token) {
      setError('관리자 로그인이 필요합니다.');
      return null;
    }

    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 20, // 기본값을 20으로 변경
      ...(params.is_active !== null && params.is_active !== undefined && { is_active: params.is_active }),
      ...(params.post_id && { post_id: params.post_id }),
    };

    try {
      const response = await api.get(PATH.ADMINCOMMENTS, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedComments: Comment[] = response.data;
      
      // 정확히 limit 개수만큼만 저장 (20개 고정)
      const requestedLimit = params.limit || 20;
      const limitedComments = fetchedComments.slice(0, requestedLimit);
      
      setComments(limitedComments);
      
      // hasNextPage 설정: API에서 받은 원본 데이터가 요청한 limit와 같거나 많으면 다음 페이지 있음
      const hasNext = fetchedComments.length >= requestedLimit;
      setHasNextPage(hasNext);
      
      console.log(`댓글 데이터 - API응답: ${fetchedComments.length}개, 화면표시: ${limitedComments.length}개, 다음페이지: ${hasNext}`);
      
      return limitedComments;
    } catch (err: any) {
      let errorMessage = '댓글 목록을 가져오는데 실패했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '관리자 인증이 필요합니다.';
      } else if (err.response?.status === 403) {
        errorMessage = '댓글 조회 권한이 없습니다.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('관리자 댓글 목록 조회 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, setComments, setLoading, setError, setHasNextPage]); // setHasNextPage 의존성 추가

  // 강제 새로고침 함수
  const refreshComments = useCallback(async (params: GetAdminCommentsParams = {}) => {
    return await bringAdminComments(params);
  }, [bringAdminComments]);

  // 특정 게시글의 댓글만 조회
  const getCommentsByPostId = useCallback(async (postId: number, params: Omit<GetAdminCommentsParams, 'post_id'> = {}) => {
    return await bringAdminComments({ ...params, post_id: postId });
  }, [bringAdminComments]);

  // 활성/비활성 댓글만 조회
  const getCommentsByStatus = useCallback(async (isActive: boolean, params: Omit<GetAdminCommentsParams, 'is_active'> = {}) => {
    return await bringAdminComments({ ...params, is_active: isActive });
  }, [bringAdminComments]);

  return {
    comments,
    bringAdminComments,
    refreshComments,
    getCommentsByPostId,
    getCommentsByStatus,
    loading,
    error,
  };
};

export default useAdminBringCommentsAll;