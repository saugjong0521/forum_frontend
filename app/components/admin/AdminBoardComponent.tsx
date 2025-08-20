'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useBoardPostStore } from '../../store/useBoardPostStore';
import { useBoardsStore } from '../../store/useBoardsStore';
import { useBringBoards } from '@/app/hooks/useBringBoards';
import AdminBoardBox from './AdminBoardBox';

export default function AdminBoardComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    currentPage,
    hasNextPage,
    currentBoardId,
    sortBy,
    sortOrder,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    setSorting,
    setBoardId
  } = useBoardPostStore();

  const { getBoardName } = useBoardsStore();
  const { boards, bringBoardsName, loading: boardsLoading, error: boardsError } = useBringBoards();

  useEffect(() => {
    bringBoardsName({ skip: 0, limit: 100 });
  }, [bringBoardsName]);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, [searchParams, setCurrentPage]);

  const updatePageInURL = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    updatePageInURL(currentPage);
  }, [currentPage]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const lastUnderscoreIndex = value.lastIndexOf('_');
    const newSortBy = value.substring(0, lastUnderscoreIndex);
    const newSortOrder = value.substring(lastUnderscoreIndex + 1);
    setSorting(newSortBy, newSortOrder);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 컴팩트한 헤더 */}
      <div className="bg-white p-3 border-b border-gray-300 flex justify-between items-center">
        {/* 게시판 네비게이션 - 더 컴팩트하게 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBoardId(null)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              currentBoardId === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
          {boards.map((board) => (
            <button
              key={board.board_id}
              onClick={() => setBoardId(board.board_id)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentBoardId === board.board_id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {board.name}
            </button>
          ))}
        </div>

        {/* 정렬 옵션 - 더 컴팩트하게 */}
        <select
          value={`${sortBy}_${sortOrder}`}
          onChange={handleSelectChange}
          className="text-xs border text-gray-700 rounded px-2 py-1"
        >
          <option value="created_at_desc">최신순</option>
          <option value="created_at_asc">오래된순</option>
          <option value="view_count_desc">조회수↓</option>
          <option value="view_count_asc">조회수↑</option>
          <option value="like_count_desc">추천수↓</option>
          <option value="like_count_asc">추천수↑</option>
        </select>
      </div>

      {/* 게시글 목록 */}
      <AdminBoardBox />

      {/* 하단 컨트롤 - 더 컴팩트하게 */}
      <div className="bg-white p-3 border-t border-gray-300 flex justify-between items-center">
        {/* 페이지네이션 */}
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`text-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-blue-600'}`}
          >
            &#x300A;
          </button>
          <span className="text-sm text-gray-700">페이지 {currentPage}</span>
          <button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className={`text-lg ${!hasNextPage ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-blue-600'}`}
          >
            &#x300B;
          </button>
        </div>

        {/* 글쓰기 버튼 */}
        <Link 
          href="board/write" 
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          글쓰기
        </Link>
      </div>
    </div>
  );
}