import { Suspense } from "react";
import BoardComponent from "@/app/components/board/BoardComponent";
import RecentBoardComponent from "@/app/components/board/RecentBoardComponent";

export default function BoardPage() {
  return (
    <div className="w-full h-full bg-[#ccc] p-[10px] flex gap-[15px]">
      <div className="w-full h-full bg-[#fff] rounded-lg p-4 gap-[10px] flex flex-col flex-4">

        <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
          <BoardComponent />
        </Suspense>

      </div>

      <div className="flex flex-1 bg-white flex-col rounded-lg h-min">
        <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
          <RecentBoardComponent
            showHeader={false}
            showTitle={true}
            limit={5}
            // titleMaxLength={20} 
          />
        </Suspense>
      </div>

    </div>
  );
}