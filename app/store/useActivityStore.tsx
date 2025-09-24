import { create } from 'zustand';
import { ActivityStore } from '../types/user';

export const useActivityStore = create<ActivityStore>((set) => ({
  // State
  activities: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,

  // Actions
  setActivities: (activities) => 
    set({ activities }),

  addActivities: (newActivities) =>
    set((state) => ({ 
      activities: [...state.activities, ...newActivities],
      currentPage: state.currentPage + 1
    })),

  setLoading: (loading) => 
    set({ loading }),

  setError: (error) => 
    set({ error }),

  setHasMore: (hasMore) => 
    set({ hasMore }),

  setCurrentPage: (page) => 
    set({ currentPage: page }),

  reset: () => 
    set({ 
      activities: [], 
      loading: false, 
      error: null, 
      hasMore: true, 
      currentPage: 0 
    }),
}));