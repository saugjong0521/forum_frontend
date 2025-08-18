'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import BringBoardBox from './BringBoardBox';
import { useBoardStore } from '../store/useBoardStore';

export default function BoardComponent() {
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
    resetBoard,
  } = useBoardStore();

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

  // 게시판 제목 표시
  const getBoardTitle = () => {
    switch (currentBoardId) {
      case 1:
        return '공지사항';
      case 2:
        return '게시판';
      default:
        return '게시판';
    }
  };

  // 정렬 변경 핸들러 (디버깅 추가)
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    console.log('정렬 변경:', { 
      이전: { sortBy, sortOrder },
      새로운: { newSortBy, newSortOrder }
    });
    setSorting(newSortBy, newSortOrder);
  };

  // select 변경 핸들러 (수정된 분할 로직)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('select 변경됨:', e.target.value);
    
    // 마지막 언더스코어를 기준으로 분할
    const value = e.target.value;
    const lastUnderscoreIndex = value.lastIndexOf('_');
    const newSortBy = value.substring(0, lastUnderscoreIndex);
    const newSortOrder = value.substring(lastUnderscoreIndex + 1);
    
    console.log('분할된 값:', { newSortBy, newSortOrder });
    handleSortChange(newSortBy, newSortOrder);
  };

  return (
    <>
      {/* 게시판 헤더 */}
      <div className="w-full bg-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{getBoardTitle()}</h2>
        
        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">정렬:</span>
          
          {/* 현재 상태 표시 (디버깅용) */}
          <span className="text-xs text-blue-600">
            현재: {sortBy}_{sortOrder}
          </span>
          
          <select 
            value={`${sortBy}_${sortOrder}`}
            onChange={handleSelectChange}
            className="text-sm border border-gray-300 rounded px-2 py-1"
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

      <BringBoardBox />

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

        {/* 확장된 디버그 정보 */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>현재 게시판: {currentBoardId} | 페이지: {currentPage} | 다음페이지: {hasNextPage ? 'O' : 'X'}</div>
          <div>정렬상태: {sortBy}_{sortOrder}</div>
          <div>select value: {`${sortBy}_${sortOrder}`}</div>
        </div>
      </div>
    </>
  );
}