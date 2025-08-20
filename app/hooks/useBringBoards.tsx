// hooks/useBringBoards.ts
import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useBoardsStore } from '../store/useBoardsStore';
import { Board, GetBoardParams } from '../types/board';

export const useBringBoards = () => {
  const {
    boards,
    loading,
    error,
    setBoards,
    setLoading,
    setError,
  } = useBoardsStore();

  const bringBoardsName = useCallback(async (params: GetBoardParams = {}) => {

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
      setBoards(fetchedBoards);
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
    return await bringBoardsName({});
  }, [bringBoardsName]);

  return {
    boards,
    bringBoardsName,
    refreshBoards,
    loading,
    error,
  };
};