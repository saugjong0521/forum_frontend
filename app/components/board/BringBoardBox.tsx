'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useBringBoardPost } from '../../hooks/useBringBoardPost';
import { useBoardPostStore } from '../../store/useBoardPostStore';
import { useUserInfoStore } from '@/app/store/useUserInfoStore';
import useDeactivatePost from '../../hooks/useDeactivatePost';

export default function BringBoardBox() {
  const { posts, bringboard, loading, error } = useBringBoardPost();
  const { 
    currentPage, 
    postsPerPage, 
    currentBoardId, 
    sortBy,
    sortOrder 
  } = useBoardPostStore();
  const { user_id } = useUserInfoStore();
  const { deactivatePost, loading: deleteLoading, error: deleteError, clearError } = useDeactivatePost();

  // 페이지, 게시판, 정렬이 변경될 때마다 게시글 가져오기
  useEffect(() => {
    console.log('BringPostBox useEffect 실행:', {
      currentPage,
      currentBoardId,
      sortBy,
      sortOrder,
      postsPerPage
    });
    console.log('현재 posts:', posts);

    const skip = (currentPage - 1) * postsPerPage;
    const params = { 
      skip, 
      limit: postsPerPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...(currentBoardId !== null && { board_id: currentBoardId })
    };

    console.log('API 호출 파라미터:', params);
    
    bringboard(params);
  }, [currentPage, currentBoardId, sortBy, sortOrder, bringboard, postsPerPage]);

  // 게시글 삭제 핸들러 (디버깅 추가)
  const handleDelete = async (postId: number, postTitle: string) => {
    console.log('🗑️ 삭제 시도:', { postId, postTitle, typeof: typeof postId });
    
    // 삭제 확인
    const isConfirmed = window.confirm(`"${postTitle}" 게시글을 정말 삭제하시겠습니까?\n게시글 ID: ${postId}`);
    if (!isConfirmed) return;

    // 에러 초기화
    clearError();

    try {
      console.log('🔄 deactivePost 호출 전:', { post_id: postId });
      
      // 게시글 삭제 요청 (비밀번호 없음)
      const success = await deactivatePost({
        post_id: postId
      });

      console.log('✅ deactivePost 결과:', { success, deleteError });

      if (success) {
        alert('게시글이 삭제되었습니다.');
        
        // 게시글 목록 새로고침
        const skip = (currentPage - 1) * postsPerPage;
        const params = { 
          skip, 
          limit: postsPerPage,
          sort_by: sortBy,
          sort_order: sortOrder,
          ...(currentBoardId !== null && { board_id: currentBoardId })
        };
        
        console.log('🔄 삭제 후 새로고침 파라미터:', params);
        bringboard(params);
      } else if (deleteError) {
        console.error('❌ 삭제 실패:', deleteError);
        alert(deleteError);
      }
      
    } catch (error) {
      console.error('❌ 게시글 삭제 오류:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 내가 작성한 게시글인지 확인하는 함수
  const isMyPost = (post: any) => {
    const result = user_id && post.author_id === user_id;

    return result;
  };

  // 10개 행을 채우기 위한 빈 행 생성 함수
  const renderTableRows = () => {
    const rows = [];
    
    // 실제 게시글 행들
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      rows.push(
        <tr key={post.post_id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm text-gray-900 border-b text-center">
            {post.post_id}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900 border-b">
            <Link 
              href={`/board/${post.post_id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {post.title}
            </Link>
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 border-b text-center">
            {isMyPost(post) ? (
              <button
                onClick={() => {
                  console.log('🖱️ 삭제 버튼 클릭:', { 
                    postId: post.post_id, 
                    postTitle: post.title,
                    postAuthorId: post.author_id 
                  });
                  handleDelete(post.post_id, post.title);
                }}
                disabled={deleteLoading}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  deleteLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
                title={`게시글 삭제 (ID: ${post.post_id})`}
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 border-b text-center">
            {post.view_count}
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 border-b text-center">
            {formatDate(post.created_at)}
          </td>
        </tr>
      );
    }
    
    // 빈 행들로 10개까지 채우기
    for (let i = posts.length; i < postsPerPage; i++) {
      rows.push(
        <tr key={`empty-${i}`}>
          <td className="px-4 py-3 text-sm text-gray-900 border-b text-center">
            &nbsp;
          </td>
          <td className="px-4 py-3 text-sm text-gray-900 border-b">
            &nbsp;
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 border-b text-center">
            &nbsp;
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 border-b text-center">
            &nbsp;
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 border-b text-center">
            &nbsp;
          </td>
        </tr>
      );
    }
    
    return rows;
  };

  return (
    <div className="flex flex-5 bg-white w-full border border-gray-300 rounded">
      {/* 에러 상태 */}
      {error && (
        <div className="w-full p-8 text-center text-red-500">
          에러: {error}
        </div>
      )}
      
      {/* 삭제 에러 표시 */}
      {deleteError && (
        <div className="w-full p-2 bg-red-50 text-red-600 text-sm text-center border-b">
          삭제 에러: {deleteError}
        </div>
      )}
      
      {/* 로딩 상태 */}
      {loading ? (
        <div className="w-full p-8 text-center text-gray-500">
          게시글을 불러오는 중...
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b w-16">번호</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">제목</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b w-20"></th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b w-20">조회수</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b w-24">작성일</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      )}
    </div>
  );
}