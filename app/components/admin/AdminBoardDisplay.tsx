'use client';

import { usePostStore } from '@/app/store/usePostStore';



const AdminBoardDisplay = () => {
  const { post: selectedPost } = usePostStore();
  if (!selectedPost) {
    return (
      <div className="flex-1 bg-white border border-gray-300 rounded p-6 ml-4">
        <div className="text-center text-gray-500 mt-20">
          <div className="text-lg mb-2">게시글을 선택해주세요</div>
          <div className="text-sm">좌측 목록에서 게시글을 클릭하면 내용을 확인할 수 있습니다.</div>
        </div>
      </div>
    );
  }

  const formatDetailDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 bg-white border border-gray-300 rounded p-6 ml-4">
      {/* 게시글 헤더 */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">{selectedPost.title}</h1>
          <span className="text-sm text-gray-500">ID: {selectedPost.post_id}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedPost.author?.nickname || '익명'}</span>
            <span>{formatDetailDate(selectedPost.created_at)}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {selectedPost.board?.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>조회수 {selectedPost.view_count}</span>
            <span>추천 {selectedPost.like_count}</span>
          </div>
        </div>
      </div>

      {/* 게시글 내용 */}
      <div className="prose max-w-none">
        <div 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: selectedPost.content || '내용이 없습니다.' }}
        />
      </div>

      {/* 게시글 정보 */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">작성자 ID:</span>
            <span className="ml-2 text-gray-900">{selectedPost.author_id}</span>
          </div>
          <div>
            <span className="text-gray-500">게시판 ID:</span>
            <span className="ml-2 text-gray-900">{selectedPost.board_id}</span>
          </div>
          <div>
            <span className="text-gray-500">상태:</span>
            <span className={`ml-2 ${selectedPost.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {selectedPost.is_active ? '활성' : '비활성'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">수정일:</span>
            <span className="ml-2 text-gray-900">
              {selectedPost.updated_at ? formatDetailDate(selectedPost.updated_at) : '없음'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBoardDisplay;