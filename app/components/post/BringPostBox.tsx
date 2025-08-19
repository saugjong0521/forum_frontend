'use client';
import { useState, useEffect } from 'react';
import useHandleRecommend from '@/app/hooks/useHandleRecommend';
import { usePostStore } from '@/app/store/usePostStore';

// usePostStore에서 타입을 추출해서 사용
interface Author {
    user_id: number;
    username: string;
    nickname: string;
    created_at: string;
}

interface Comment {
    content: string;
    parent_id: number;
    comment_id: number;
    post_id: number;
    author_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: Author;
    children: string[];
}

interface Post {
    title: string;
    content: string;
    board_id: number;
    password: string;
    post_id: number;
    author_id: number;
    view_count: number;
    like_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: Author;
    comments: Comment[];
}


interface BringPostBoxProps {
    post: Post;
    onPostUpdate?: (updatedPost: Post) => void;
}

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

const BringPostBox = ({ post, onPostUpdate }: BringPostBoxProps) => {
    const [currentLikeCount, setCurrentLikeCount] = useState(post.like_count);
    const [isRecommended, setIsRecommended] = useState(false);
    
    const { recommendPost, undoRecommend, loading, error, clearError } = useHandleRecommend();

    // 게시글이 변경되면 추천 수 동기화
    useEffect(() => {
        setCurrentLikeCount(post.like_count);
    }, [post.like_count]);

    // 추천하기
    const handleRecommend = async () => {
        const success = await recommendPost(post.post_id); // post_id 사용
        
        if (success) {
            setCurrentLikeCount(prev => prev + 1);
            setIsRecommended(true);
            clearError();
            
            // 부모 컴포넌트에 업데이트 알림
            if (onPostUpdate) {
                onPostUpdate({
                    ...post,
                    like_count: currentLikeCount + 1
                });
            }
        }
    };

    // 추천 해제
    const handleUndoRecommend = async () => {
        const success = await undoRecommend(post.post_id); // post_id 사용
        
        if (success) {
            setCurrentLikeCount(prev => prev - 1);
            setIsRecommended(false);
            clearError();
            
            // 부모 컴포넌트에 업데이트 알림
            if (onPostUpdate) {
                onPostUpdate({
                    ...post,
                    like_count: currentLikeCount - 1
                });
            }
        }
    };

    return (
        <div className="bg-white rounded-lg border border-[#000] p-6 mb-4">
            {/* 게시글 헤더 */}
            <div className="border-b border-[#000] pb-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {post.title}
                </h1>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <span className="font-medium">{post.author.nickname}</span>
                        <span>{formatDate(post.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span>조회수 {post.view_count}</span>
                        <span>추천 {currentLikeCount}</span>
                    </div>
                </div>
            </div>

            {/* 게시글 내용 */}
            <div className="prose max-w-none mb-6">
                <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>

            {/* 추천/추천해제 버튼 */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-center gap-4">
                    {!isRecommended ? (
                        <button
                            onClick={handleRecommend}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-10h2m5-10h-1a2 2 0 00-2 2v1" />
                            </svg>
                            {loading ? '추천 중...' : '추천하기'}
                        </button>
                    ) : (
                        <button
                            onClick={handleUndoRecommend}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-10h2m5-10h-1a2 2 0 00-2 2v1" />
                            </svg>
                            {loading ? '해제 중...' : '추천 해제'}
                        </button>
                    )}
                    
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