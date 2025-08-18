import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useBoardsNameStore } from '../store/useBoardsNameStore';

interface Board {
  slug: string;
  name: string;
  description: string;
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

interface GetBoardsParams {
  skip?: number;
  limit?: number;
  forceRefresh?: boolean; // 강제 새로고침 옵션
}

export const useBringBoardsName = () => {
  const {
    boards,
    loading,
    error,
    setBoards,
    setLoading,
    setError,
    shouldRefetch,
  } = useBoardsNameStore();

  const bringBoardsName = useCallback(async (params: GetBoardsParams = {}) => {
    const { forceRefresh = false } = params;
    
    // 캐시된 데이터가 있고 강제 새로고침이 아니며 만료되지 않았다면 return
    if (!forceRefresh && boards.length > 0 && !shouldRefetch()) {
      console.log('useBringBoardsName: 캐시된 데이터 사용');
      return boards;
    }

    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 100,
    };

    console.log('useBringBoardsName API 호출:', {
      입력_params: params,
      최종_queryParams: queryParams,
      캐시상태: { 
        기존_boards_길이: boards.length,
        shouldRefetch: shouldRefetch(),
        forceRefresh 
      }
    });

    try {
      const response = await api.get(PATH.GETBOARDNAME, {
        params: queryParams,
      });

      const fetchedBoards: Board[] = response.data;
      setBoards(fetchedBoards); // useBoardsNameStore에 저장
      return fetchedBoards;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시판 목록을 가져오는데 실패했습니다.';
      setError(errorMessage);
      console.error('게시판 목록 조회 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [boards.length, shouldRefetch, setBoards, setLoading, setError]);

  // 강제 새로고침 함수
  const refreshBoards = useCallback(async () => {
    return await bringBoardsName({ forceRefresh: true });
  }, [bringBoardsName]);

  return {
    boards,
    bringBoardsName,
    refreshBoards,
    loading,
    error,
  };
};