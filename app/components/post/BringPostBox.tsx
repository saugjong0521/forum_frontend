'use client';

interface Author {
    user_id: number;
    username: string;
    nickname: string;
    created_at: string;
}

interface Post {
    title: string;
    content: string;
    board_id: number;
    password: string;
    id: number;
    author_id: number;
    view_count: number;
    like_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author: Author;
}

interface BringPostBoxProps {
    post: Post;
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

const BringPostBox = ({ post }: BringPostBoxProps) => {
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
                        <span>추천 {post.like_count}</span>
                    </div>
                </div>
            </div>

            {/* 게시글 내용 */}
            <div className="prose max-w-none">
                <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
        </div>
    );
};

export default BringPostBox;