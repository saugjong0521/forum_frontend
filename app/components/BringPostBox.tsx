'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useBringPost } from '../hooks/useBringPost';

interface BringPostBoxProps {
  currentPage: number;
}

export default function BringPostBox({ currentPage }: BringPostBoxProps) {
  const { posts, bringPosts, loading, error } = useBringPost();
  
  const POSTS_PER_PAGE = 10;

  // 페이지가 변경될 때마다 게시글 가져오기
  useEffect(() => {
    const skip = (currentPage - 1) * POSTS_PER_PAGE;
    bringPosts({ 
      skip, 
      limit: POSTS_PER_PAGE,
      board_id: 2
    });
  }, [currentPage]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

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
            {posts.length > 0 ? (
              posts.map((post) => (
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
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  게시글이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}