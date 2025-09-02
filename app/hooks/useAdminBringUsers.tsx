// hooks/useAdminBringUsers.ts
import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { useAdminUserStore } from '../store/useAdminUserStore';

export interface GetAdminUsersParams {
  skip?: number;
  limit?: number;
  is_active?: boolean | null;
}

const useAdminBringUsers = () => {
  const { token } = useSessionTokenStore();
  const {
    users,
    loading,
    error,
    setUsers,
    setLoading,
    setError,
    setHasNextPage,
  } = useAdminUserStore();

  const bringAdminUsers = useCallback(async (params: GetAdminUsersParams = {}) => {
    if (!token) {
      setError('관리자 로그인이 필요합니다.');
      return null;
    }

    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 20,
      ...(params.is_active !== null && params.is_active !== undefined && { is_active: params.is_active }),
    };

    try {
      const response = await api.get(PATH.ADMINGETUSERS, {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedUsers = response.data;
      
      // 정확히 limit 개수만큼만 저장
      const requestedLimit = params.limit || 20;
      const limitedUsers = fetchedUsers.slice(0, requestedLimit);
      
      setUsers(limitedUsers);
      
      // hasNextPage 설정
      const hasNext = fetchedUsers.length >= requestedLimit;
      setHasNextPage(hasNext);
      
      console.log(`사용자 데이터 - API응답: ${fetchedUsers.length}개, 화면표시: ${limitedUsers.length}개, 다음페이지: ${hasNext}`);
      
      return limitedUsers;
    } catch (err: any) {
      let errorMessage = '사용자 목록을 가져오는데 실패했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '관리자 인증이 필요합니다.';
      } else if (err.response?.status === 403) {
        errorMessage = '사용자 조회 권한이 없습니다.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('사용자 목록 조회 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, setUsers, setLoading, setError, setHasNextPage]);

  // 강제 새로고침 함수
  const refreshUsers = useCallback(async (params: GetAdminUsersParams = {}) => {
    return await bringAdminUsers(params);
  }, [bringAdminUsers]);

  // 활성/비활성 사용자만 조회
  const getUsersByStatus = useCallback(async (isActive: boolean, params: Omit<GetAdminUsersParams, 'is_active'> = {}) => {
    return await bringAdminUsers({ ...params, is_active: isActive });
  }, [bringAdminUsers]);

  return {
    users,
    bringAdminUsers,
    refreshUsers,
    getUsersByStatus,
    loading,
    error,
  };
};

export default useAdminBringUsers;