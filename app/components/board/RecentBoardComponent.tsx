'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useBringRecentBoard } from '../../hooks/useBringRecentBoard';
import { RecentBoardType } from '../../types/board'; // 추가

export default function RecentBoardComponent({
  showHeader = true,
  showTitle = true,
  limit = 5,
  titleMaxLength = 15
}: RecentBoardType) { // 타입 변경
  const { posts, bringSideBoard, loading, error } = useBringRecentBoard();

  // 컴포넌트 마운트 시 전체 게시글 가져오기
  useEffect(() => {
    bringSideBoard({
      skip: 0,
      limit: limit,
      board_id: null, // 전체 게시글
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  }, [bringSideBoard, limit]);

  // 제목 길이 제한 함수
  const truncateTitle = (title: string, maxLength: number = titleMaxLength) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  // 게시판 이름 말줄임표 함수 추가
  const truncateBoardName = (name: string, maxLength: number = 5) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // 컴팩트한 행 렌더링
  const renderCompactRows = () => {
    const rows = [];

    // 실제 게시글 행들만 렌더링 (빈 행 없음)
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      rows.push(
        <tr key={post.post_id} className="hover:bg-gray-50 h-[35px]">
          <td className="px-2 text-xs text-gray-600 border-b border-gray-300 text-center w-12 align-middle">
            {post.post_id}
          </td>
          <td className="px-2 text-xs text-gray-900 border-b border-gray-300 align-middle">
            <Link
              href={`/board/${post.post_id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline block"
              title={post.title}
            >
              {truncateTitle(post.title)}
            </Link>
          </td>
          <td className="px-2 text-xs text-gray-500 border-b border-gray-300 text-center w-20 align-middle">
            <div className="truncate max-w-[50px] mx-auto" title={post.board?.name}>
              {truncateBoardName(post.board?.name || '')}
            </div>
          </td>
        </tr>
      );
    }

    return rows;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* 컴포넌트 제목 헤더 (옵션) */}
      {showTitle && (
        <div className="flex-shrink-0 bg-gray-100 px-3 py-2 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              최신 게시글
            </h3>
            <span className="text-xs text-gray-500">
              최근 {limit}개
            </span>
          </div>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="flex-shrink-0 overflow-hidden">
        {error ? (
          <div className="p-4 text-center text-red-500 text-xs">
            에러: {error}
          </div>
        ) : loading ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            로딩 중...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            게시글이 없습니다
          </div>
        ) : (
          <table className="w-full table-fixed">
            {/* 테이블 헤더 (옵션) */}
            {showHeader && (
              <thead className="bg-gray-50">
                <tr className="h-[35px]">
                  <th className="px-2 text-left text-xs font-medium text-gray-600 border-b w-12">번호</th>
                  <th className="px-2 text-left text-xs font-medium text-gray-600 border-b">제목</th>
                  <th className="px-2 text-center text-xs font-medium text-gray-600 border-b w-20">게시판</th>
                </tr>
              </thead>
            )}
            <tbody>
              {renderCompactRows()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}