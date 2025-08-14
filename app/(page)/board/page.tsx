
// page.tsx 또는 다른 컴포넌트에서

import Link from "next/link";


export default function EditorPage() {
  return (
    <div className="w-full h-full bg-[#ccc] p-[10px]">

      <div className="w-full h-full bg-[#fff] rounded-lg p-4 gap-[10px] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-[#000]">게시판</h2>

        <div className="flex flex-5 bg-[#aaa] w-full"></div>

        <div className="flex flex-1 bg-[#aaa] gap-[10px] flex-col">
          <div className="flex flex-1 bg-[#bbb] items-center justify-end">
            <Link href="board/write" className="border bg-blue-400 px-4 py-1 rounded-lg border-blue-500">
              <p className="text-[#fff]">글쓰기</p>
            </Link>
          </div>
          <div className="flex flex-1 bg-[#bbb] gap-6 justify-center">
            <div className="text-[#000] text-3xl">&#x300A;</div>
            <div className="text-[#000] text-3xl">&#x300B;</div>
          </div>
        </div>

        <div className="flex flex-1 bg-[#aaa]"></div>

      </div>

    </div>
  )
}