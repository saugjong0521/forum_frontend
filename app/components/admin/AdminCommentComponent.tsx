'use client';
import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import AdminCommentsAllBox from './AdminCommentsAllBox';
import { useAdminCommentsStore } from '../../store/useAdminCommentsStore';
import { useBoardsStore } from '../../store/useBoardsStore';
import { useBringBoards } from '@/app/hooks/useBringBoards';

export default function AdminCommentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Admin 댓글 관련 store
  const {
    currentSkip,
    currentLimit,
    isActiveFilter,
    currentPostId,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setCurrentSkip,
    setCurrentLimit,
    setIsActiveFilter,
    setCurrentPostId,
    reset: resetComments
  } = useAdminCommentsStore();

  // 게시판 목록 관련 store & hook
  const { getBoardName } = useBoardsStore();
  const { boards, bringBoardsName, loading: boardsLoading, error: boardsError } = useBringBoards();

  // 컴포넌트 마운트 시 20개로 설정 및 게시판 목록 가져오기
  useEffect(() => {
    setCurrentLimit(20);
    bringBoardsName({
      skip: 0,
      limit: 100
    });
  }, [setCurrentLimit, bringBoardsName]);

  // URL에서 파라미터 읽어오기
  useEffect(() => {
    const skipParam = searchParams.get('skip');
    const postIdParam = searchParams.get('post_id');
    
    if (skipParam) {
      const skipNumber = parseInt(skipParam, 10);
      if (!isNaN(skipNumber) && skipNumber >= 0) {
        setCurrentSkip(skipNumber);
      }
    }
    
    if (postIdParam) {
      const postIdNumber = parseInt(postIdParam, 10);
      if (!isNaN(postIdNumber) && postIdNumber > 0) {
        setCurrentPostId(postIdNumber);
      }
    }
  }, [searchParams, setCurrentSkip, setCurrentPostId]);

  // 파라미터 변경 시 URL 업데이트
  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (currentSkip > 0) params.set('skip', currentSkip.toString());
    if (currentPostId) params.set('post_id', currentPostId.toString());
    
    router.push(`?${params.toString()}`);
  };

  // currentSkip이나 currentPostId가 변경될 때마다 URL 업데이트
  useEffect(() => {
    updateURLParams();
  }, [currentSkip, currentPostId]);

  // 이전/다음 페이지 핸들러
  const handlePrevPage = () => {
    goToPrevPage();
  };

  const handleNextPage = () => {
    goToNextPage();
  };

  // is_active 필터 변경 핸들러
  const handleIsActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let filterValue: boolean | null;
    
    if (value === 'all') {
      filterValue = null;
    } else if (value === 'active') {
      filterValue = true;
    } else {
      filterValue = false;
    }
    
    console.log('is_active 필터 변경:', { value, filterValue });
    setIsActiveFilter(filterValue);
  };

  // post_id 필터 변경 핸들러
  const handlePostIdFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const postId = value ? parseInt(value, 10) : null;
    
    if (value === '' || (!isNaN(postId!) && postId! > 0)) {
      setCurrentPostId(postId);
    }
  };

  // is_active 필터 값을 select value로 변환
  const getActiveFilterSelectValue = () => {
    if (isActiveFilter === null) return 'all';
    return isActiveFilter ? 'active' : 'inactive';
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setIsActiveFilter(null);
    setCurrentPostId(null);
  };

  const currentPage = Math.floor(currentSkip / currentLimit) + 1;
  const hasPrevPage = currentSkip > 0;

  return (
    <>
      {/* 댓글 헤더 */}
      <div className="w-full bg-white p-2 flex justify-between items-center">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-[#000]">댓글 관리</h2>
        
        {/* 필터 및 정렬 옵션 */}
        <div className="flex items-center gap-4">
          {/* 게시글 ID 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#000]">게시글 ID:</span>
            <input
              type="number"
              value={currentPostId || ''}
              onChange={handlePostIdFilterChange}
              placeholder="전체"
              className="text-sm border text-[#000] rounded px-2 py-1 w-20"
              min="1"
            />
          </div>
          
          {/* is_active 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#000]">상태:</span>
            <select
              value={getActiveFilterSelectValue()}
              onChange={handleIsActiveFilterChange}
              className="text-sm border text-[#000] rounded px-2 py-1"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          
          {/* 필터 초기화 버튼 */}
          <button
            onClick={handleResetFilters}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      </div>
      
      <AdminCommentsAllBox />
      
      <div className="flex flex-1 bg-white gap-[10px] flex-col">
        {/* 페이지네이션 */}
        <div className="flex flex-1 bg-white gap-6 justify-center items-center">
          <button
            onClick={handlePrevPage}
            disabled={!hasPrevPage}
            className={`text-3xl ${!hasPrevPage ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-blue-600'}`}
          >
            &#x300A;
          </button>
          <span className="text-lg text-gray-700">
            페이지 {currentPage} {currentPostId && `(게시글 ${currentPostId})`}
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