'use client';

import React, { useEffect } from 'react';
import BringCommentBox from './BringCommentBox';
import { useCommentStore } from '@/app/store/useCommentStore';
import { Comment } from '@/app/types/board';

interface CommentComponentProps {
    onCommentsUpdate?: (comments: Comment[]) => void; // 댓글 업데이트 시 부모에게 알림
}

const CommentComponent = ({ onCommentsUpdate }: CommentComponentProps) => {
    // Store에서 댓글 상태 구독
    const { comments } = useCommentStore();

    // 댓글 변경 시 부모 컴포넌트에 알림
    useEffect(() => {
        if (onCommentsUpdate) {
            onCommentsUpdate(comments);
        }
    }, [comments, onCommentsUpdate]);

    return (
        <div>
            <BringCommentBox />
        </div>
    );
};

export default CommentComponent;