import { useCallback } from 'react';
import { PATH } from '../constants/path';
import { api } from '../api';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { useActivityStore } from '../store/useActivityStore';
import { UserActivity, UseBringActivityReturn } from '../types/user';

const PAGE_SIZE = 20;

export const useBringActivity = (): UseBringActivityReturn => {
  const { token } = useSessionTokenStore();
  const {
    activities,
    loading,
    error,
    hasMore,
    currentPage,
    setLoading,
    setError,
    setActivities,
    addActivities,
    setHasMore,
    reset
  } = useActivityStore();

  // 첫 번째 페이지 로드
  const fetchActivities = useCallback(async (): Promise<void> => {
    if (!token) {
      setError('인증 토큰이 없습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(PATH.RECENTACTIVITY, {
        params: {
          skip: 0,
          limit: PAGE_SIZE
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newActivities: UserActivity[] = response.data;
      setActivities(newActivities);
      setHasMore(newActivities.length === PAGE_SIZE);
      
    } catch (err: any) {
      setError(err.response?.data?.message || '활동 기록을 불러오는데 실패했습니다.');
      console.error('Activity fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, setActivities, setError, setHasMore, setLoading]);

  // 다음 페이지 로드 (더보기)
  const loadMoreActivities = useCallback(async (): Promise<void> => {
    if (!token || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(PATH.RECENTACTIVITY, {
        params: {
          skip: currentPage * PAGE_SIZE,
          limit: PAGE_SIZE
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newActivities: UserActivity[] = response.data;
      
      if (newActivities.length > 0) {
        addActivities(newActivities);
        setHasMore(newActivities.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || '추가 활동 기록을 불러오는데 실패했습니다.');
      console.error('Load more activities error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, loading, hasMore, currentPage, addActivities, setError, setHasMore, setLoading]);

  return {
    activities,
    loading,
    error,
    hasMore,
    fetchActivities,
    loadMoreActivities,
    reset,
  };
};