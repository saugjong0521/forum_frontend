'use client';
import useUploadComment from '@/app/hooks/useUploadComment';
import useBringComments from '@/app/hooks/useBringComments'; // 새로 만든 훅 import
import { useState } from 'react';
import { usePostStore } from '@/app/store/usePostStore';

interface Author {
    id: number;
    username: string;
    nickname: string;
    created_at: string;
}

interface Comment {
    content: string;
    parent_id: number;
    id: number;
    post_id: number;
    author_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: Author;
    children: string[];
}

interface BringCommentBoxProps {
    // comments와 postId는 더 이상 props로 받지 않음 (훅에서 처리)
    onCommentAdded?: (newComment: Comment) => void; // 댓글 추가 후 콜백
    onCommentUpdated?: (updatedComment: Comment) => void; // 댓글 수정 후 콜백
    onCommentDeleted?: (commentId: number) => void; // 댓글 삭제 후 콜백
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
    onCommentUpdated, 
    onCommentDeleted 
}: BringCommentBoxProps) => {
    const [newComment, setNewComment] = useState('');

    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    
    // 훅들
    const { uploadComment, loading: uploadLoading, error: uploadError, clearError: clearUploadError } = useUploadComment();
    const { comments, loading: commentsLoading, error: commentsError, refetch, clearError: clearCommentsError } = useBringComments();
    const { post } = usePostStore(); // 추가

    // 로딩 상태 통합
    const loading = uploadLoading || commentsLoading;
    
    // 에러 상태 통합
    const error = uploadError || commentsError;
    
    // 에러 클리어 함수 통합
    const clearError = () => {
        clearUploadError();
        clearCommentsError();
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
            
            // 댓글 목록 새로고침
            await refetch();
            
            // 부모 컴포넌트에 새 댓글 추가 알림
            if (onCommentAdded) {
                onCommentAdded(result);
            }
        }
    };



    // 댓글 수정 시작
    const handleStartEdit = (comment: Comment) => {
        setEditingComment(comment.id);
        setEditContent(comment.content);
    };

    // 댓글 수정 취소
    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditContent('');
    };

    // 댓글 수정 완료 (실제 구현은 수정 훅이 필요)
    const handleUpdateComment = async (commentId: number) => {
        // TODO: useUpdateComment 훅 구현 후 실제 수정 로직 추가
        console.log('댓글 수정:', commentId, editContent);
        
        // 임시로 상태만 업데이트 (실제로는 API 호출 후 결과를 받아와야 함)
        if (onCommentUpdated) {
            const updatedComment = comments.find(c => c.id === commentId);
            if (updatedComment) {
                onCommentUpdated({
                    ...updatedComment,
                    content: editContent,
                    updated_at: new Date().toISOString()
                });
            }
        }
        
        setEditingComment(null);
        setEditContent('');
        
        // 댓글 목록 새로고침
        await refetch();
        
        alert('댓글이 수정되었습니다!');
    };

    // 댓글 삭제 (실제 구현은 삭제 훅이 필요)
    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
        
        // TODO: useDeleteComment 훅 구현 후 실제 삭제 로직 추가
        console.log('댓글 삭제:', commentId);
        
        // 댓글 목록 새로고침
        await refetch();
        
        // 임시로 부모에게 삭제 알림
        if (onCommentDeleted) {
            onCommentDeleted(commentId);
        }
        
        alert('댓글이 삭제되었습니다!');
    };

    const renderComment = (comment: Comment) => (
        <div key={comment.id} className="border-b border-gray-200 py-4">
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
                        {comment.updated_at !== comment.created_at && (
                            <span className="text-xs text-gray-400 ml-1">
                                (수정됨)
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleStartEdit(comment)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                        disabled={loading}
                    >
                        수정
                    </button>
                    <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                        disabled={loading}
                    >
                        삭제
                    </button>
                </div>
            </div>
            
            {/* 댓글 내용 또는 수정 입력창 */}
            {editingComment === comment.id ? (
                <div className="mt-2">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded resize-none"
                        rows={3}
                        disabled={loading}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button 
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={loading || !editContent.trim()}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? '수정 중...' : '수정 완료'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-gray-800 leading-relaxed mb-3">
                    {comment.content}
                </div>
            )}
        </div>
    );

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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full p-3 border text-[#000] rounded resize-none"
                    rows={4}
                    disabled={loading}
                />
                {error && (
                    <div className="text-red-600 text-sm mt-2">
                        {error}
                    </div>
                )}
                <div className="flex justify-end mt-3">
                    <button 
                        onClick={handleSubmitComment}
                        disabled={loading || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? '작성 중...' : '댓글 작성'}
                    </button>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-0">
                {comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
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