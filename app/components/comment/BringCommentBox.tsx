'use client';
import React, { useEffect, useState } from 'react';
import useUploadComment from '@/app/hooks/useUploadComment';
import useBringComments from '@/app/hooks/useBringComments';
import { usePostStore } from '@/app/store/usePostStore';
import useDeactivateComment from '@/app/hooks/useDeactivateComment';
import { useCommentStore } from '@/app/store/useCommentStore';
import { useUserInfoStore } from '@/app/store/useUserInfoStore';
import { Comment } from '@/app/types/board';

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

// 전체 댓글 개수를 계산하는 함수 (중복 제거)
const countTotalComments = (comments: Comment[]): number => {
    const uniqueIds = new Set<number>();

    const addUniqueComments = (commentList: Comment[]) => {
        commentList.forEach(comment => {
            uniqueIds.add(comment.comment_id);
            if (comment.children && comment.children.length > 0) {
                addUniqueComments(comment.children);
            }
        });
    };

    addUniqueComments(comments);
    return uniqueIds.size;
};

const BringCommentBox = () => {
    // Store에서 상태 가져오기
    const {
        comments,
        loading: storeLoading,
        error: storeError,
        replyingTo,
        replyContent,
        setComments,
        addComment,
        removeComment,
        setLoading,
        setError,
        clearError: clearStoreError,
        setReplyingTo,
        setReplyContent,
        clearReply
    } = useCommentStore();

    // useUserInfoStore에서 user_id 가져오기
    const { user_id } = useUserInfoStore();

    // 훅들
    const { uploadComment, loading: uploadLoading, error: uploadError, clearError: clearUploadError } = useUploadComment();
    const { comments: fetchedComments, loading: commentsLoading, error: commentsError, refetch, clearError: clearCommentsError } = useBringComments();
    const { deactivateComment, loading: deleteLoading, error: deleteError, clearError: clearDeleteError } = useDeactivateComment();
    const { post } = usePostStore();

    // Store의 comments와 hook의 comments 동기화
    useEffect(() => {
        if (fetchedComments !== undefined) {
            setComments(fetchedComments);
        }
    }, [fetchedComments, setComments]);

    // 로딩 상태 통합
    const loading = storeLoading || uploadLoading || commentsLoading || deleteLoading;

    // Store 로딩 상태 업데이트
    useEffect(() => {
        setLoading(uploadLoading || commentsLoading || deleteLoading);
    }, [uploadLoading, commentsLoading, deleteLoading, setLoading]);

    // 에러 상태 통합
    const error = storeError || uploadError || commentsError || deleteError;

    // Store 에러 상태 업데이트
    useEffect(() => {
        const combinedError = uploadError || commentsError || deleteError;
        setError(combinedError);
    }, [uploadError, commentsError, deleteError, setError]);

    // 에러 클리어 함수 통합
    const clearError = () => {
        clearStoreError();
        clearUploadError();
        clearCommentsError();
        clearDeleteError();
    };

    // 새 댓글 작성
    const handleSubmitComment = async (content: string) => {
        if (!content.trim()) return;

        if (!post?.post_id) {
            alert('게시글 정보를 찾을 수 없습니다.');
            return;
        }

        const result = await uploadComment({
            post_id: post.post_id,
            content: content
        });

        if (result) {
            clearError();
            // refetch만 호출하고 addComment는 호출하지 않음 (중복 방지)
            await refetch();
        }
    };

    // 대댓글 작성
    const handleSubmitReply = async (parentId: number) => {
        if (!replyContent.trim()) return;

        if (!post?.post_id) {
            alert('게시글 정보를 찾을 수 없습니다.');
            return;
        }

        const result = await uploadComment({
            post_id: post.post_id,
            content: replyContent,
            parent_id: parentId
        });

        if (result) {
            clearReply();
            clearError();
            // refetch만 호출하고 addComment는 호출하지 않음 (중복 방지)
            await refetch();
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

        const success = await deactivateComment(commentId);

        if (success) {
            await refetch(); // API에서 최신 데이터 가져오기
            alert('댓글이 삭제되었습니다!');
        }
    };

    // 댓글과 대댓글을 트리 구조로 렌더링하는 함수
    const renderCommentWithReplies = (comment: Comment) => {
        const isParentComment = comment.parent_id === null;

        return (
            <div key={comment.comment_id}>
                {/* 부모 댓글 */}
                <div className={`border-b border-gray-200 py-4 ${!isParentComment ? 'ml-8 border-l-2 border-blue-100 pl-4' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {comment.author.nickname?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-900">
                                    {comment.author.nickname}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {formatDate(comment.created_at)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex w-[30px]">
                                {/* 현재 사용자가 댓글 작성자인 경우에만 삭제 버튼 표시 */}
                                {user_id === comment.author_id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.comment_id)}
                                        className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
                                        disabled={loading}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                            <div className="flex w-[30px]">
                                {isParentComment && (
                                    <button
                                        onClick={() => setReplyingTo(comment.comment_id)}
                                        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                                        disabled={loading}
                                    >
                                        답글
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-800 leading-relaxed mb-3">
                        {comment.content}
                    </div>

                    {/* 답글 입력창 */}
                    {replyingTo === comment.comment_id && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="답글을 입력하세요..."
                                    className="flex-1 h-[40px] p-2 border text-[#000] rounded resize-none"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => handleSubmitReply(comment.comment_id)}
                                    disabled={loading || !replyContent.trim()}
                                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? '작성중' : '답글'}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        clearReply();
                                        clearError();
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-800 "
                                    disabled={loading}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 자식 댓글들 (대댓글) 재귀적으로 렌더링 */}
                {comment.children && comment.children.length > 0 && (
                    <div className="ml-8">
                        {comment.children.map(childComment => (
                            <div key={childComment.comment_id} className="border-l-2 border-blue-100 pl-4">
                                {renderCommentWithReplies(childComment)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // 로딩 상태 표시
    if (commentsLoading && comments.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-[#888] text-[#000] p-6">
                <div className="text-center py-8">
                    <div className="text-gray-500">댓글을 불러오는 중...</div>
                </div>
            </div>
        );
    }

    // 전체 댓글 개수 계산 (중복 제거)
    const totalComments = countTotalComments(comments);

    return (
        <div className="bg-white rounded-lg border border-[#888] text-[#000] p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                댓글 ({totalComments})
            </h3>

            {/* 댓글 작성 */}
            <CommentInput onSubmit={handleSubmitComment} loading={loading} />

            {error && (
                <div className="text-red-600 text-sm mb-2">
                    {error}
                </div>
            )}

            {/* 댓글 목록 - 부모 댓글들만 렌더링 (자식은 재귀적으로 처리) */}
            <div className="space-y-0">
                {comments.length > 0 ? (
                    comments
                        .filter(comment => comment.parent_id === null) // 부모 댓글만 필터링
                        .map(comment => renderCommentWithReplies(comment))
                ) : (
                    <div className="text-center py-8 text-[#777]">
                        첫 번째 댓글을 작성해보세요!
                    </div>
                )}
            </div>
        </div>
    );
};

// 댓글 입력 컴포넌트 분리
const CommentInput = ({ onSubmit, loading }: { onSubmit: (content: string) => void, loading: boolean }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        onSubmit(newComment);
        setNewComment('');
    };

    return (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg flex justify-center items-center gap-[10px]">
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full h-[50px] p-3 border text-[#000] rounded resize-none"
                disabled={loading}
            />
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !newComment.trim()}
                    className="flex py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 w-[60px] items-center justify-center"
                >
                    {loading ? '작성 중' : '작성'}
                </button>
            </div>
        </div>
    );
};

export default BringCommentBox;