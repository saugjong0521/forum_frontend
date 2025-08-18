'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import BringPostBox from './BringPostBox';
import { useBoardStore } from '../store/useBoardStore';

export default function BoardComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    currentPage,
    hasNextPage,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
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

  return (
    <>
      <BringPostBox />

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