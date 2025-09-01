'use client';
import React, { useEffect } from 'react';
import useAdminBringComments from '@/app/hooks/useAdminBringComments';
import useAdminDeleteComment from '@/app/hooks/useAdminDeleteComment';
import useAdminDeactivateComment from '@/app/hooks/useAdminDeactivateComment';
import { Comment } from '@/app/types/board';
import useAdminActivateComment from '@/app/hooks/useAdminActivateComment';

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

interface AdminCommentBoxProps {
    postId: number;
}

const AdminCommentBox = ({ postId }: AdminCommentBoxProps) => {
    // 훅들
    const { comments, loading: commentsLoading, error: commentsError, fetchComments, refetch, clearError: clearCommentsError } = useAdminBringComments();
    const { deleteComment, loading: deleteLoading, error: deleteError, clearError: clearDeleteError } = useAdminDeleteComment();
    const { deactivateComment, loading: deactivateLoading, error: deactivateError, clearError: clearDeactivateError } = useAdminDeactivateComment();
    const { activateComment, loading: activateLoading, error: activateError, clearError: clearActivateError } = useAdminActivateComment();

    // 게시글 ID가 변경되면 댓글을 새로 가져옴
    useEffect(() => {
        if (postId) {
            fetchComments(postId);
        }
    }, [postId, fetchComments]);

    // 로딩 상태 통합
    const loading = commentsLoading || deleteLoading || deactivateLoading || activateLoading;

    // 에러 상태 통합
    const error = commentsError || deleteError || deactivateError || activateError;

    // 에러 클리어 함수 통합
    const clearError = () => {
        clearCommentsError();
        clearDeleteError();
        clearDeactivateError();
        clearActivateError();
    };

    // 댓글 완전 삭제
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('정말로 이 댓글을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        const success = await deleteComment(commentId);

        if (success) {
            await refetch(postId);
            alert('댓글이 삭제되었습니다!');
        }
    };

    // 댓글 비활성화
    const handleDeactivateComment = async (commentId: number) => {
        if (!confirm('이 댓글을 비활성화하시겠습니까?')) return;

        const success = await deactivateComment(commentId);

        if (success) {
            await refetch(postId);
            alert('댓글이 비활성화되었습니다!');
        }
    };

    // 댓글 활성화
    const handleActivateComment = async (commentId: number) => {
        if (!confirm('이 댓글을 활성화하시겠습니까?')) return;

        const success = await activateComment(commentId);

        if (success) {
            await refetch(postId);
            alert('댓글이 활성화되었습니다!');
        }
    };

    // 댓글과 대댓글을 트리 구조로 렌더링하는 함수
    const renderCommentWithReplies = (comment: Comment) => {
        const isParentComment = comment.parent_id === null;

        return (
            <div key={comment.comment_id}>
                {/* 댓글 */}
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
                                    ID: {comment.author_id}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {formatDate(comment.created_at)}
                                </span>
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                                    comment.is_active 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-red-100 text-red-600'
                                }`}>
                                    {comment.is_active ? '활성' : '비활성'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">#{comment.comment_id}</span>
                            
                            {/* 관리 버튼들 */}
                            <div className="flex gap-1">
                                {/* 활성화/비활성화 버튼 */}
                                {comment.is_active ? (
                                    <button
                                        onClick={() => handleDeactivateComment(comment.comment_id)}
                                        disabled={loading}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            loading 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                        }`}
                                    >
                                        {deactivateLoading ? '처리중' : '비활성'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleActivateComment(comment.comment_id)}
                                        disabled={loading}
                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                            loading 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                    >
                                        {activateLoading ? '처리중' : '활성'}
                                    </button>
                                )}
                                
                                {/* 삭제 버튼 */}
                                <button
                                    onClick={() => handleDeleteComment(comment.comment_id)}
                                    disabled={loading}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        loading 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                                >
                                    {deleteLoading ? '삭제중' : '삭제'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={`leading-relaxed mb-3 ${
                        comment.is_active ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                        {comment.content}
                    </div>
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
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center py-4">
                        <div className="text-gray-500">댓글을 불러오는 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    // 전체 댓글 개수 계산 (중복 제거)
    const totalComments = countTotalComments(comments);

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    댓글 관리 ({totalComments})
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border">
                        {error}
                        <button 
                            onClick={clearError}
                            className="ml-2 text-red-800 hover:text-red-900"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* 댓글 목록 - 부모 댓글들만 렌더링 (자식은 재귀적으로 처리) */}
                <div className="space-y-0 bg-white rounded border">
                    {comments.length > 0 ? (
                        comments
                            .filter(comment => comment.parent_id === null) // 부모 댓글만 필터링
                            .map(comment => renderCommentWithReplies(comment))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            댓글이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCommentBox;