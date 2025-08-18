'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useBringBoard } from '../hooks/useBringBoard';
import { useBoardStore } from '../store/useBoardStore';

export default function BringBoardBox() {
  const { posts, bringboard, loading, error } = useBringBoard();
  const { 
    currentPage, 
    postsPerPage, 
    currentBoardId, 
    sortBy, 
    sortOrder 
  } = useBoardStore();

  // 페이지, 게시판, 정렬이 변경될 때마다 게시글 가져오기
  useEffect(() => {
    console.log('BringPostBox useEffect 실행:', {
      currentPage,
      currentBoardId,
      sortBy,
      sortOrder,
      postsPerPage
    });

    const skip = (currentPage - 1) * postsPerPage;
    const params = { 
      skip, 
      limit: postsPerPage,
      board_id: currentBoardId,
      sort_by: sortBy,
      sort_order: sortOrder
    };

    console.log('API 호출 파라미터:', params);
    
    bringboard(params);
  }, [currentPage, currentBoardId, sortBy, sortOrder, bringboard, postsPerPage]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 10개 행을 채우기 위한 빈 행 생성 함수
  const renderTableRows = () => {
    const rows = [];
    
    // 실제 게시글 행들
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      rows.push(
        <tr key={post.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm text-gray-900 border-b text-center">
            {post.id}
          </td>
          <td className="px-4 py-3 text-sm text-gray-900 border-b">
            <Link 
              href={`/board/${post.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {post.title}
            </Link>
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
        </tr>
      );
    }
    
    return rows;
  };

  // 디버깅: posts 데이터 확인
  useEffect(() => {
    if (posts.length > 0) {
      console.log('받은 게시글 데이터:', posts);
      console.log('첫 번째 게시글 날짜:', posts[0]?.created_at);
      console.log('마지막 게시글 날짜:', posts[posts.length - 1]?.created_at);
    }
  }, [posts]);

  return (
    <div className="flex flex-5 bg-white w-full border border-gray-300 rounded">
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