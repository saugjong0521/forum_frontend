'use client';

import { useState, useEffect } from 'react';
import BringCommentBox from './BringCommentBox';

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

interface CommentComponentProps {
    comments: Comment[];
    postId: number;
    onCommentsUpdate?: (comments: Comment[]) => void; // 댓글 업데이트 시 부모에게 알림
}

const CommentComponent = ({ comments: initialComments, postId, onCommentsUpdate }: CommentComponentProps) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);

    // 새 댓글이 추가될 때 호출되는 함수
    const handleCommentAdded = (newComment: Comment) => {
        const updatedComments = [...comments, newComment];
        setComments(updatedComments);
        
        // 부모 컴포넌트에 업데이트된 댓글 목록 전달
        if (onCommentsUpdate) {
            onCommentsUpdate(updatedComments);
        }
    };

    // 댓글이 수정될 때 호출되는 함수
    const handleCommentUpdated = (updatedComment: Comment) => {
        const updatedComments = comments.map(comment => 
            comment.id === updatedComment.id ? updatedComment : comment
        );
        setComments(updatedComments);
        
        if (onCommentsUpdate) {
            onCommentsUpdate(updatedComments);
        }
    };

    // 댓글이 삭제될 때 호출되는 함수
    const handleCommentDeleted = (commentId: number) => {
        const updatedComments = comments.filter(comment => comment.id !== commentId);
        setComments(updatedComments);
        
        if (onCommentsUpdate) {
            onCommentsUpdate(updatedComments);
        }
    };

    // 외부에서 댓글 목록이 변경될 때 동기화
    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);

    return (
        <div>
            <BringCommentBox 
                comments={comments}
                postId={postId}
                onCommentAdded={handleCommentAdded}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
            />
        </div>
    );
};

export default CommentComponent;