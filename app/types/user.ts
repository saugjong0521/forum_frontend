// types/user.ts

export interface UserType {
  username: string;
  email: string;
  nickname: string;
  user_id: number;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignData {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

// Activity 관련 타입 정의 (새로운 API 구조)
export interface UserActivityAuthor {
  user_id: number;
  username: string;
  nickname: string;
  created_at: string;
}

export interface UserActivityTarget {
  id: number;
  type: string;
  title?: string;
  preview?: string;
  author: UserActivityAuthor;
  url: string;
  category?: string;
  post?: {
    title: string;
  };
}

export interface UserActivityMetadata {
  ip_address: string;
  user_agent: string;
  os_info: string;
  browser_info: string;
  device_type: string;
}

export interface UserActivity {
  activity_id: number;
  user_id: number;
  activity_type: string;
  created_at: string;
  target: UserActivityTarget;
  metadata: UserActivityMetadata;
}

// API 요청 파라미터 타입
export interface UserActivityParams {
  skip?: number;
  limit?: number;
}

// Activity Store 상태 타입
export interface UserActivityState {
  activities: UserActivity[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

// Activity Store 액션 타입
export interface UserActivityActions {
  setActivities: (activities: UserActivity[]) => void;
  addActivities: (activities: UserActivity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

// Activity Store 전체 타입
export type ActivityStore = UserActivityState & UserActivityActions;

// Hook 반환 타입
export interface UseBringActivityReturn {
  activities: UserActivity[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchActivities: () => Promise<void>;
  loadMoreActivities: () => Promise<void>;
  reset: () => void;
}