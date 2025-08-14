import BoardComponent from "@/app/components/BoardComponent";

export default function BoardPage() {
  return (
    <div className="w-full h-full bg-[#ccc] p-[10px]">
      <div className="w-full h-full bg-[#fff] rounded-lg p-4 gap-[10px] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-[#000]">게시판</h2>

        <BoardComponent />

        <div className="flex flex-1 bg-white"></div>
      </div>
    </div>
  );
}