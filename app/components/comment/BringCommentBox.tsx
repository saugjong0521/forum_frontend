'use client';
import useUploadComment from '@/app/hooks/useUploadComment';
import useBringComments from '@/app/hooks/useBringComments';
import { useState } from 'react';
import { usePostStore } from '@/app/store/usePostStore';
import useDeactivateComment from '@/app/hooks/useDeactivateComment';

interface Author {
    user_id: number;
    username: string;
    nickname: string;
    created_at: string;
}

interface Comment {
    content: string;
    parent_id: number | null;
    comment_id: number;
    post_id: number;
    author_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    author: Author;
    children: string[];
}

interface BringCommentBoxProps {
    onCommentAdded?: (newComment: Comment) => void;
    onCommentDeleted?: (commentId: number) => void;
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

const BringCommentBox = ({
    onCommentAdded,
    onCommentDeleted
}: BringCommentBoxProps) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // 훅들
    const { uploadComment, loading: uploadLoading, error: uploadError, clearError: clearUploadError } = useUploadComment();
    const { comments, loading: commentsLoading, error: commentsError, refetch, clearError: clearCommentsError } = useBringComments();
    const { deactivateComment, loading: deleteLoading, error: deleteError, clearError: clearDeleteError } = useDeactivateComment();
    const { post } = usePostStore();

    // 로딩 상태 통합
    const loading = uploadLoading || commentsLoading || deleteLoading;

    // 에러 상태 통합
    const error = uploadError || commentsError || deleteError;

    // 에러 클리어 함수 통합
    const clearError = () => {
        clearUploadError();
        clearCommentsError();
        clearDeleteError();
    };

    // 새 댓글 작성
    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        if (!post?.id) {
            alert('게시글 정보를 찾을 수 없습니다.');
            return;
        }

        const result = await uploadComment({
            post_id: post.id,
            content: newComment
        });

        if (result) {
            setNewComment('');
            clearError();
            await refetch();

            if (onCommentAdded) {
                onCommentAdded(result);
            }
        }
    };

    // 대댓글 작성
    const handleSubmitReply = async (parentId: number) => {
        if (!replyContent.trim()) return;

        if (!post?.id) {
            alert('게시글 정보를 찾을 수 없습니다.');
            return;
        }

        const result = await uploadComment({
            post_id: post.id,
            content: replyContent,
            parent_id: parentId
        });

        if (result) {
            setReplyContent('');
            setReplyingTo(null);
            clearError();
            await refetch();

            if (onCommentAdded) {
                onCommentAdded(result);
            }
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

        const success = await deactivateComment(commentId);

        if (success) {
            await refetch();

            if (onCommentDeleted) {
                onCommentDeleted(commentId);
            }

            alert('댓글이 삭제되었습니다!');
        }
    };

    // 댓글과 대댓글을 구분해서 렌더링하는 함수
    const renderCommentWithReplies = (comment: Comment) => {
        const isParentComment = comment.parent_id === null;
        
        return (
            <div key={comment.comment_id}>
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
                            {isParentComment && (
                                <button
                                    onClick={() => setReplyingTo(comment.comment_id)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                    disabled={loading}
                                >
                                    답글
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteComment(comment.comment_id)}
                                className="text-sm text-red-600 hover:text-red-800"
                                disabled={loading}
                            >
                                삭제
                            </button>
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
                                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? '작성중' : '답글'}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setReplyContent('');
                                        clearError();
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                    disabled={loading}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
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

    return (
        <div className="bg-white rounded-lg border border-[#888] text-[#000] p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                댓글 ({comments.length})
            </h3>

            {/* 댓글 작성 */}
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
                        onClick={handleSubmitComment}
                        disabled={loading || !newComment.trim()}
                        className="flex py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 w-[60px] items-center justify-center"
                    >
                        {loading ? '작성 중' : '작성'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-sm mb-2">
                    {error}
                </div>
            )}

            {/* 댓글 목록 */}
            <div className="space-y-0">
                {comments.length > 0 ? (
                    comments.map(comment => renderCommentWithReplies(comment))
                ) : (
                    <div className="text-center py-8 text-[#777]">
                        첫 번째 댓글을 작성해보세요!
                    </div>
                )}
            </div>
        </div>
    );
};

export default BringCommentBox;