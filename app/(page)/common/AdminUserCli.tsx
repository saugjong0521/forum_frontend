'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminUserStore } from '../../store/useAdminUserStore';
import AdminUserBox from '@/app/components/admin/AdminUserBox';

export default function AdminUserCli() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    currentSkip,
    currentLimit,
    isActiveFilter,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setCurrentSkip,
    setCurrentLimit,
    setIsActiveFilter,
    reset: resetUsers
  } = useAdminUserStore();

  // 컴포넌트 마운트 시 20개로 설정
  useEffect(() => {
    setCurrentLimit(20);
  }, [setCurrentLimit]);

  // URL에서 페이지 파라미터 읽어오기
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        const skip = (pageNumber - 1) * currentLimit;
        setCurrentSkip(skip);
      }
    }
  }, [searchParams, currentLimit, setCurrentSkip]);

  // 페이지 변경 시 URL 업데이트
  const updatePageInURL = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  // currentSkip이 변경될 때마다 URL 업데이트
  useEffect(() => {
    const currentPage = Math.floor(currentSkip / currentLimit) + 1;
    updatePageInURL(currentPage);
  }, [currentSkip, currentLimit]);

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

  // is_active 필터 값을 select value로 변환
  const getActiveFilterSelectValue = () => {
    if (isActiveFilter === null) return 'all';
    return isActiveFilter ? 'active' : 'inactive';
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setIsActiveFilter(null);
  };

  const currentPage = Math.floor(currentSkip / currentLimit) + 1;
  const hasPrevPage = currentSkip > 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* 사용자 관리 헤더 */}
      <div className="w-full bg-white p-2 flex justify-between items-center">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-[#000]">사용자 관리</h2>
        
        {/* 필터 옵션 */}
        <div className="flex items-center gap-4">
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
      
      {/* 사용자 목록 테이블 */}
      <AdminUserBox />
      
      {/* 페이지네이션 */}
      <div className="flex flex-1 bg-white gap-[10px] flex-col">
        <div className="flex flex-1 bg-white gap-6 justify-center items-center">
          <button
            onClick={handlePrevPage}
            disabled={!hasPrevPage}
            className={`text-3xl ${!hasPrevPage ? 'text-gray-300 cursor-not-allowed' : 'text-black hover:text-blue-600'}`}
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
    </div>
  );
}