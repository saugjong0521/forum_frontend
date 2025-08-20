'use client';

import AdminBoardComponent from "@/app/components/admin/AdminBoardComponent";
import AdminBoardDisplay from "@/app/components/admin/AdminBoardDisplay";

const ContentAdmin = () => {
  return (
    <div className="w-full h-full flex gap-4 p-4">
      {/* 좌측 게시글 목록 */}
      <div className="w-1/2 h-full flex flex-col">
        <AdminBoardComponent />
      </div>
      
      {/* 우측 게시글 상세 */}
      <div className="w-1/2 h-full">
        <AdminBoardDisplay />
      </div>
    </div>
  );
};

export default ContentAdmin;