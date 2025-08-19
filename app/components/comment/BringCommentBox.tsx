'use client';
import { useState, useEffect } from 'react';
import useHandleRecommend from '@/app/hooks/useHandleRecommend';
import useCheckRecommend from '@/app/hooks/useCheckRecommend';
import { useRecommendStore } from '@/app/store/useRecommendStore';
import { usePostStore } from '@/app/store/usePostStore';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const BringPostBox = () => {
    const { post } = usePostStore();
    const [currentLikeCount, setCurrentLikeCount] = useState(post?.like_count || 0);
    
    // 훅들
    const { recommendPost, undoRecommend, loading: recommendLoading, error: recommendError, clearError: clearRecommendError } = useHandleRecommend();
    const { checkRecommend, loading: checkLoading, error: checkError, clearError: clearCheckError } = useCheckRecommend();
    
    // 스토어에서 추천 상태 가져오기
    const { getRecommendState } = useRecommendStore();
    const recommendState = post?.post_id ? getRecommendState(post.post_id) : undefined;
    
    // 로딩 상태 통합
    const loading = recommendLoading || checkLoading;
    
    // 에러 상태 통합
    const error = recommendError || checkError;
    
    // 에러 클리어 함수 통합
    const clearError = () => {
        clearRecommendError();
        clearCheckError();
    };

    // 컴포넌트 마운트 시 추천 상태 확인
    useEffect(() => {
        if (post?.post_id && !recommendState) {
            checkRecommend(post.post_id);
        }
    }, [post?.post_id]);

    // 게시글이 변경되면 추천 수 동기화
    useEffect(() => {
        if (post?.like_count !== undefined) {
            setCurrentLikeCount(post.like_count);
        }
    }, [post?.like_count]);

    // 추천/추천해제 토글 함수
    const handleToggleRecommend = async () => {
        if (!post?.post_id) {
            console.error('게시글 ID가 없습니다.');
            return;
        }

        const isCurrentlyRecommended = recommendState?.is_recommended || false;
        let success = false;
        let newLikeCount = currentLikeCount;

        if (isCurrentlyRecommended) {
            // 현재 추천 상태라면 추천 해제
            success = await undoRecommend(post.post_id);
            if (success) {
                newLikeCount = currentLikeCount - 1;
            }
        } else {
            // 현재 추천 안된 상태라면 추천
            success = await recommendPost(post.post_id);
            if (success) {
                newLikeCount = currentLikeCount + 1;
            }
        }
        
        if (success) {
            setCurrentLikeCount(newLikeCount);
            clearError();
        }
    };

    // post가 없는 경우 에러 처리
    if (!post) {
        return (
            <div className="bg-white rounded-lg border border-[#888] text-[#000] p-6 mb-4">
                <div className="text-center text-gray-500">
                    게시글을 불러올 수 없습니다.
                </div>
            </div>
        );
    }

    const isRecommended = recommendState?.is_recommended || false;

    return (
        <div className="bg-white rounded-lg border border-[#888] text-[#000] p-6 mb-4">
            {/* 게시글 헤더 */}
            <div className="border-b border-[#888] pb-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {post?.title || '제목 없음'}
                </h1>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <span className="font-medium">
                            {post?.author?.nickname || '익명'}
                        </span>
                        <span>{formatDate(post?.created_at || '')}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span>조회수 {post?.view_count || 0}</span>
                        <span>추천 {currentLikeCount}</span>
                    </div>
                </div>
            </div>

            {/* 게시글 내용 */}
            <div className="prose max-w-none mb-6">
                <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post?.content || '' }}
                />
            </div>

            {/* 추천/추천해제 버튼 */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handleToggleRecommend}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                            isRecommended
                                ? 'bg-gray-600 text-white hover:bg-gray-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill={isRecommended ? "currentColor" : "none"}
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-10h2m5-10h-1a2 2 0 00-2 2v1" />
                        </svg>
                        {loading 
                            ? (isRecommended ? '해제 중...' : '추천 중...') 
                            : (isRecommended ? '추천 해제' : '추천하기')
                        }
                    </button>
                    
                    <div className="text-sm text-gray-500">
                        추천 {currentLikeCount}
                    </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="mt-3 text-center">
                        <div className="text-red-600 text-sm">
                            {error}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BringPostBox;