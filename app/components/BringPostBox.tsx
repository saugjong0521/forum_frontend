'use client';

interface Author {
    id: number;
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
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-4">
            {/* 게시글 헤더 */}
            <div className="border-b border-gray-200 pb-4 mb-4">
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

            {/* 게시글 액션 */}
            <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex items-center justify-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <span>👍</span>
                        <span>추천 ({post.like_count})</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <span>📝</span>
                        <span>수정</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        <span>🗑️</span>
                        <span>삭제</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BringPostBox;