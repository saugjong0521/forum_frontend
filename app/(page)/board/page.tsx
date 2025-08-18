import { Suspense } from "react";
import BoardComponent from "@/app/components/BoardComponent";

export default function BoardPage() {
  return (
    <div className="w-full h-full bg-[#ccc] p-[10px]">
      <div className="w-full h-full bg-[#fff] rounded-lg p-4 gap-[10px] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-[#000]">게시판리스트 추가하는게 좋으려나</h2>

        <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
          <BoardComponent />
        </Suspense>

        <div className="flex flex-1 bg-white"></div>
      </div>
    </div>
  );
}