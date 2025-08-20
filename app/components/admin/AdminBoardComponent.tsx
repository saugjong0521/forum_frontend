'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import AdminBoardBox from './AdminBoardBox';
import { useAdminBoardPostStore } from '../../store/useAdminBoardPostStore';
import { useBoardsStore } from '../../store/useBoardsStore';
import { useBringBoards } from '@/app/hooks/useBringBoards';

export default function AdminBoardComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Admin 게시글 관련 store
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
    resetBoard,
    setBoardId,
    setPostsPerPage
  } = useAdminBoardPostStore();

  // 게시판 목록 관련 store & hook
  const { getBoardName } = useBoardsStore();
  const { boards, bringBoardsName, loading: boardsLoading, error: boardsError } = useBringBoards();

  // 컴포넌트 마운트 시 20개로 설정 및 게시판 목록 가져오기
  useEffect(() => {
    setPostsPerPage(20);
    bringBoardsName({
      skip: 0,
      limit: 100
    });
  }, [setPostsPerPage, bringBoardsName]);

  // URL에서 페이지 번호 읽어오기
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, [searchParams, setCurrentPage]);

  // 페이지 변경 시 URL 업데이트
  const updatePageInURL = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // currentPage가 변경될 때마다 URL 업데이트
  useEffect(() => {
    updatePageInURL(currentPage);
  }, [currentPage]);

  // 이전/다음 페이지 핸들러
  const handlePrevPage = () => {
    goToPrevPage();
  };

  const handleNextPage = () => {
    goToNextPage();
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    console.log('정렬 변경:', {
      이전: { sortBy, sortOrder },
      새로운: { newSortBy, newSortOrder }
    });
    setSorting(newSortBy, newSortOrder);
  };

  // select 변경 핸들러
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('select 변경됨:', e.target.value);

    const value = e.target.value;
    const lastUnderscoreIndex = value.lastIndexOf('_');
    const newSortBy = value.substring(0, lastUnderscoreIndex);
    const newSortOrder = value.substring(lastUnderscoreIndex + 1);

    console.log('분할된 값:', { newSortBy, newSortOrder });
    handleSortChange(newSortBy, newSortOrder);
  };

  // 게시판 클릭 핸들러
  const handleBoardThemeClick = (id: number) => {
    console.log('게시판 클릭:', id);
    setBoardId(id);
  };

  // 전체 게시판 클릭 핸들러
  const handleAllBoardsClick = () => {
    console.log('전체 게시판 클릭');
    setBoardId(null);
  };

  return (
    <>
      {/* 게시판 헤더 */}
      <div className="w-full bg-white p-4 flex justify-between items-center">

        {/* 게시판 네비게이션 */}
        <div className="flex items-center gap-2">
          {boardsLoading ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : boardsError ? (
            <div className="text-sm text-red-500">에러: {boardsError}</div>
          ) : (
            <>
              {/* 전체 게시판 버튼 */}
              <button
                onClick={handleAllBoardsClick}
                className={`px-3 py-1 text-sm rounded transition-colors ${currentBoardId === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                전체
              </button>

              {/* 개별 게시판 버튼들 */}
              {boards.map((board) => (
                <button
                  key={board.board_id}
                  onClick={() => handleBoardThemeClick(board.board_id)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${currentBoardId === board.board_id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {board.name}
                </button>
              ))}
            </>
          )}
        </div>

        <h2 className="text-xl font-bold text-[#000]">관리자 - {getBoardName(currentBoardId)}</h2>

        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#000]">정렬:</span>

          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={handleSelectChange}
            className="text-sm border text-[#000] rounded px-2 py-1"
          >
            <option value="created_at_desc">작성시간 내림차순</option>
            <option value="created_at_asc">작성시간 오름차순</option>
            <option value="view_count_desc">조회수 내림차순</option>
            <option value="view_count_asc">조회수 오름차순</option>
            <option value="like_count_desc">추천수 내림차순</option>
            <option value="like_count_asc">추천수 오름차순</option>
            <option value="comment_count_desc">댓글수 내림차순</option>
            <option value="comment_count_asc">댓글수 오름차순</option>
          </select>
        </div>
      </div>

      <AdminBoardBox />

      <div className="flex flex-1 bg-white gap-[10px] flex-col">
        <div className="flex flex-1 bg-white items-center justify-end">
          <Link href="board/write" className="border bg-blue-400 px-4 py-1 rounded-lg border-blue-500 hover:bg-blue-500 transition-colors">
            <p className="text-[#fff]">글쓰기</p>
          </Link>
        </div>

        {/* 페이지네이션 */}
        <div className="flex flex-1 bg-white gap-6 justify-center items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`text-3xl ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-blue-600'}`}
          >
            &#x300A;
          </button>

          <span className="text-lg text-gray-700">
            페이지 {currentPage}
          </span>

          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className={`text-3xl ${!hasNextPage ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-blue-600'}`}
          >
            &#x300B;
          </button>
        </div>
      </div>
    </>
  );
}