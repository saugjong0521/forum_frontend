'use client';

import { useEffect } from 'react';
import { useAdminBoardPost } from '../../hooks/useAdminBoardPost';
import { useAdminBoardPostStore } from '../../store/useAdminBoardPostStore';
import { useUserInfoStore } from '@/app/store/useUserInfoStore';
import { usePostStore } from '@/app/store/usePostStore';
import useAdminDeactivatePost from '@/app/hooks/useAdminDeactivatePost';
import useAdminDeletePost from '@/app/hooks/useAdminDeletePost';
import useAdminActivatePost from '@/app/hooks/useAdminActivatePost';

export default function AdminBoardBox() {
  const { posts, bringboard, loading, error } = useAdminBoardPost();
  const { 
    currentPage, 
    postsPerPage, 
    currentBoardId, 
    sortBy,
    sortOrder,
    isActiveFilter // ✅ 추가됨
  } = useAdminBoardPostStore();
  const { user_id } = useUserInfoStore();
  const { post: selectedPost, setPost } = usePostStore();
  const { deactivatePost, loading: deactivateLoading, error: deactivateError, clearError: clearDeactivateError } = useAdminDeactivatePost();
  const { activatePost, loading: activateLoading, error: activateError, clearError: clearActivateError } = useAdminActivatePost();
  const { deletePost, loading: deleteLoading, error: deleteError, clearError: clearDeleteError } = useAdminDeletePost();

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
  }, [currentPage, currentBoardId, sortBy, sortOrder, isActiveFilter, bringboard, postsPerPage]); // ✅ isActiveFilter 의존성 추가

  const handleActivate = async (postId: number, postTitle: string) => {
    const isConfirmed = window.confirm(`"${postTitle}" 게시글을 활성화하시겠습니까?`);
    if (!isConfirmed) return;

    clearActivateError();
    const success = await activatePost({ post_id: postId });

    if (success) {
      alert('게시글이 활성화되었습니다.');
      refreshPosts();
    } else if (activateError) {
      alert(activateError);
    }
  };

  const handleDeactivate = async (postId: number, postTitle: string) => {
    const isConfirmed = window.confirm(`"${postTitle}" 게시글을 비활성화하시겠습니까?`);
    if (!isConfirmed) return;

    clearDeactivateError();
    const success = await deactivatePost({ post_id: postId });

    if (success) {
      alert('게시글이 비활성화되었습니다.');
      refreshPosts();
    } else if (deactivateError) {
      alert(deactivateError);
    }
  };

  const handleDelete = async (postId: number, postTitle: string) => {
    const isConfirmed = window.confirm(`"${postTitle}" 게시글을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`);
    if (!isConfirmed) return;

    clearDeleteError();
    const success = await deletePost({ post_id: postId });

    if (success) {
      alert('게시글이 삭제되었습니다.');
      refreshPosts();
    } else if (deleteError) {
      alert(deleteError);
    }
  };

  const refreshPosts = () => {
    const skip = (currentPage - 1) * postsPerPage;
    const params = { 
      skip, 
      limit: postsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...(currentBoardId !== null && { board_id: currentBoardId })
    };
    bringboard(params);
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

  // 게시글 행의 스타일을 결정하는 함수
  const getRowClassName = (post: any) => {
    let baseClasses = 'h-8 cursor-pointer transition-colors';
    
    // 선택된 게시글 스타일
    if (selectedPost?.post_id === post.post_id) {
      baseClasses += ' bg-blue-50';
    }
    // 비활성 게시글 스타일 (is_active: false)
    else if (!post.is_active) {
      baseClasses += ' bg-gray-100 hover:bg-gray-150';
    }
    // 일반 게시글 스타일
    else {
      baseClasses += ' hover:bg-gray-50';
    }
    
    return baseClasses;
  };

  // 텍스트 스타일을 결정하는 함수
  const getTextClassName = (post: any, baseClass: string) => {
    if (!post.is_active) {
      // 비활성 게시글은 텍스트를 더 흐리게
      return baseClass.replace('text-gray-900', 'text-gray-500').replace('text-gray-600', 'text-gray-400');
    }
    return baseClass;
  };

  const isLoading = deactivateLoading || activateLoading || deleteLoading;

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
      {(deactivateError || activateError || deleteError) && (
        <div className="p-2 bg-red-50 text-red-600 text-sm text-center border-b">
          에러: {deactivateError || activateError || deleteError}
        </div>
      )}
      
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="h-10">
            <th className="px-2 text-left font-medium text-gray-700 border-b w-12">ID</th>
            <th className="px-2 text-left font-medium text-gray-700 border-b">제목</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">게시판</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">상태</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-12">조회</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">작성일</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-20">관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr 
              key={post.post_id} 
              className={getRowClassName(post)}
              onClick={() => setPost(post)}
            >
              <td className={`px-2 border-b text-center align-middle ${getTextClassName(post, 'text-gray-600')}`}>
                {post.post_id}
              </td>
              <td className={`px-2 border-b align-middle ${getTextClassName(post, 'text-gray-900')}`}>
                <div className="truncate" title={post.title}>
                  {truncateTitle(post.title)}
                </div>
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                <div className="truncate max-w-[50px] mx-auto" title={post.board?.name}>
                  {post.board?.name}
                </div>
              </td>
              <td className="px-2 border-b text-center align-middle">
                {post.is_active ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                    활성
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                    비활성
                  </span>
                )}
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {post.view_count}
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {formatDate(post.created_at)}
              </td>
              <td className="px-1 text-center border-b align-middle">
                <div className="flex gap-1 justify-center">
                  {/* 활성화/비활성화 버튼 */}
                  {post.is_active ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeactivate(post.post_id, post.title);
                      }}
                      disabled={isLoading}
                      className={`px-1 py-0.5 text-xs rounded transition-colors ${
                        isLoading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {deactivateLoading ? '처리중' : '비활성'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(post.post_id, post.title);
                      }}
                      disabled={isLoading}
                      className={`px-1 py-0.5 text-xs rounded transition-colors ${
                        isLoading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {activateLoading ? '처리중' : '활성'}
                    </button>
                  )}
                  
                  {/* 삭제 버튼 - 항상 표시 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.post_id, post.title);
                    }}
                    disabled={isLoading}
                    className={`px-1 py-0.5 text-xs rounded transition-colors ${
                      isLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {deleteLoading ? '삭제중' : '삭제'}
                  </button>
                </div>
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
              <td className="px-2 border-b">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}