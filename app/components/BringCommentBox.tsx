'use client';

import { useState } from 'react';

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
    comments: Comment[];
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

const BringCommentBox = ({ comments }: BringCommentBoxProps) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const handleSubmitComment = () => {
        if (!newComment.trim()) return;
        
        // TODO: 댓글 작성 API 호출
        console.log('새 댓글:', newComment);
        setNewComment('');
    };

    const handleSubmitReply = (parentId: number) => {
        if (!replyContent.trim()) return;
        
        // TODO: 대댓글 작성 API 호출
        console.log('대댓글:', { parentId, content: replyContent });
        setReplyContent('');
        setReplyingTo(null);
    };

    const renderComment = (comment: Comment, isReply = false) => (
        <div 
            key={comment.id} 
            className={`border-b border-gray-100 py-4 ${isReply ? 'ml-8 pl-4 border-l-2 border-blue-200' : ''}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{comment.author.nickname}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {!isReply && (
                        <button 
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            답글
                        </button>
                    )}
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                        수정
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-800">
                        삭제
                    </button>
                </div>
            </div>
            
            <div className="text-gray-800 leading-relaxed mb-3">
                {comment.content}
            </div>

            {/* 대댓글 입력창 */}
            {replyingTo === comment.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요..."
                        className="w-full p-2 border border-gray-300 rounded resize-none"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button 
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                            취소
                        </button>
                        <button 
                            onClick={() => handleSubmitReply(comment.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            답글 작성
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                댓글 ({comments.length})
            </h3>

            {/* 댓글 작성 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full p-3 border border-gray-300 rounded resize-none"
                    rows={4}
                />
                <div className="flex justify-end mt-3">
                    <button 
                        onClick={handleSubmitComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        댓글 작성
                    </button>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-0">
                {comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        첫 번째 댓글을 작성해보세요!
                    </div>
                )}
            </div>
        </div>
    );
};

export default BringCommentBox;