// types/recommend.ts

// 추천 데이터 (API 응답과 일치)
export interface RecommendState {
  post_id: number;
  user_id: number;
  is_recommended: boolean;
  recommendation_id?: number;
  created_at?: string;
}

