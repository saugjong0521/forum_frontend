import { create } from 'zustand';

interface RecommendState {
    post_id: number;
    user_id: number;
    is_recommended: boolean;
    recommendation_id?: number;
    created_at?: string;
}

interface RecommendStore {
    recommendStates: Map<number, RecommendState>;
    setRecommendState: (postId: number, state: RecommendState) => void;
    getRecommendState: (postId: number) => RecommendState | undefined;
    toggleRecommend: (postId: number) => void;
    clearRecommendState: (postId: number) => void;
    clearAllRecommendStates: () => void;
}

export const useRecommendStore = create<RecommendStore>((set, get) => ({
    recommendStates: new Map(),

    setRecommendState: (postId: number, state: RecommendState) => {
        set((prevState) => {
            const newMap = new Map(prevState.recommendStates);
            newMap.set(postId, state);
            return { recommendStates: newMap };
        });
    },

    getRecommendState: (postId: number) => {
        return get().recommendStates.get(postId);
    },

    toggleRecommend: (postId: number) => {
        const currentState = get().getRecommendState(postId);
        if (currentState) {
            set((prevState) => {
                const newMap = new Map(prevState.recommendStates);
                newMap.set(postId, {
                    ...currentState,
                    is_recommended: !currentState.is_recommended
                });
                return { recommendStates: newMap };
            });
        }
    },

    clearRecommendState: (postId: number) => {
        set((prevState) => {
            const newMap = new Map(prevState.recommendStates);
            newMap.delete(postId);
            return { recommendStates: newMap };
        });
    },

    clearAllRecommendStates: () => {
        set({ recommendStates: new Map() });
    }
}));