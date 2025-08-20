'use client';

import { useEffect } from 'react';
import { useAdminBoardPost } from '../../hooks/useAdminBoardPost';
import { useAdminBoardPostStore } from '../../store/useAdminBoardPostStore';
import { useUserInfoStore } from '@/app/store/useUserInfoStore';
import { usePostStore } from '@/app/store/usePostStore';
import useDeactivatePost from '../../hooks/useDeactivatePost';

export default function AdminBoardBox() {
  const { posts, bringboard, loading, error } = useAdminBoardPost();
  const { 
    currentPage, 
    postsPerPage, 
    currentBoardId, 
    sortBy,
    sortOrder
  } = useAdminBoardPostStore();
  const { user_id } = useUserInfoStore();
  const { post: selectedPost, setPost } = usePostStore();
  const { deactivatePost, loading: deleteLoading, error: deleteError, clearError } = useDeactivatePost();

  useEffect(() => {
    const skip = (currentPage - 1) * postsPerPage;
    const params = { 
      skip, 
      limit: postsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...(currentBoardId !== null && { board_id: currentBoardId })
    };
    
    bringboard(params);
  }, [currentPage, currentBoardId, sortBy, sortOrder, bringboard, postsPerPage]);

  const handleDelete = async (postId: number, postTitle: string) => {
    const isConfirmed = window.confirm(`"${postTitle}" 게시글을 정말 삭제하시겠습니까?`);
    if (!isConfirmed) return;

    clearError();
    const success = await deactivatePost({ post_id: postId });

    if (success) {
      alert('게시글이 삭제되었습니다.');
      const skip = (currentPage - 1) * postsPerPage;
      const params = { 
        skip, 
        limit: postsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...(currentBoardId !== null && { board_id: currentBoardId })
      };
      bringboard(params);
    } else if (deleteError) {
      alert(deleteError);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const isMyPost = (post: any) => {
    return user_id && post.author_id === user_id;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white border border-gray-300 rounded p-4">
        <div className="text-center text-gray-500">게시글을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white border border-gray-300 rounded p-4">
        <div className="text-center text-red-500">에러: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-gray-300 rounded">
      {deleteError && (
        <div className="p-2 bg-red-50 text-red-600 text-sm text-center border-b">
          삭제 에러: {deleteError}
        </div>
      )}
      
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="h-10">
            <th className="px-2 text-left font-medium text-gray-700 border-b w-12">ID</th>
            <th className="px-2 text-left font-medium text-gray-700 border-b">제목</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">게시판</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-12">조회</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">작성일</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-12">관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr 
              key={post.post_id} 
              className={`h-8 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedPost?.post_id === post.post_id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setPost(post)}
            >
              <td className="px-2 text-gray-600 border-b text-center align-middle">
                {post.post_id}
              </td>
              <td className="px-2 text-gray-900 border-b align-middle">
                <div className="truncate" title={post.title}>
                  {truncateTitle(post.title)}
                </div>
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                <div className="truncate max-w-[50px] mx-auto" title={post.board?.name}>
                  {post.board?.name}
                </div>
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {post.view_count}
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {formatDate(post.created_at)}
              </td>
              <td className="px-2 text-center border-b align-middle">
                {isMyPost(post) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.post_id, post.title);
                    }}
                    disabled={deleteLoading}
                    className={`px-1 py-0.5 text-xs rounded transition-colors ${
                      deleteLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {deleteLoading ? '삭제중' : '삭제'}
                  </button>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
            </tr>
          ))}
          
          {/* 빈 행들로 20개까지 채우기 */}
          {Array.from({ length: Math.max(0, postsPerPage - posts.length) }, (_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}