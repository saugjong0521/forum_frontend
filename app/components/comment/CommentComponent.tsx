'use client';

import BringCommentBox from './BringCommentBox';

interface Author {
    user_id: number;
    username: string;
    nickname: string;
    created_at: string;
}

interface Comment {
    content: string;
    parent_id: number | null; // null 허용으로 수정
    comment_id: number;
    post_id: number;
    author_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null; // null 허용으로 수정
    author: Author;
    children: string[];
}

interface CommentComponentProps {
    onCommentsUpdate?: (comments: Comment[]) => void; // 댓글 업데이트 시 부모에게 알림
}

const CommentComponent = ({ onCommentsUpdate }: CommentComponentProps) => {
    // 새 댓글이 추가될 때 호출되는 함수
    const handleCommentAdded = (newComment: Comment) => {
        // BringCommentBox가 자체적으로 댓글 목록을 관리하므로
        // 여기서는 부모 컴포넌트에만 알림
        if (onCommentsUpdate) {
            // 실제 댓글 목록은 BringCommentBox에서 관리되므로 
            // 여기서는 새 댓글만 전달하거나 refetch를 유도
            console.log('새 댓글 추가됨:', newComment);
        }
    };

    // 댓글이 삭제될 때 호출되는 함수
    const handleCommentDeleted = (commentId: number) => {
        if (onCommentsUpdate) {
            console.log('댓글 삭제됨:', commentId);
        }
    };

    return (
        <div>
            <BringCommentBox 
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
            />
        </div>
    );
};

export default CommentComponent;