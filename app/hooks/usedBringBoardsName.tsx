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
  } = useBoardsNameStore();

  const bringBoardsName = useCallback(async (params: GetBoardsParams = {}) => {

    setLoading(true);
    setError(null);

    const queryParams = {
      skip: params.skip || 0,
      limit: params.limit || 100,
    };

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
  }, [boards.length, setBoards, setLoading, setError]);

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