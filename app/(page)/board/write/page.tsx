'use client';

// page.tsx 또는 다른 컴포넌트에서
import { SlateTextEditor } from "@/app/components";
import { useRouter } from 'next/navigation';

export default function WriteBoard() {
    const router = useRouter();
    
    const handleGoBack = () => {
        // 히스토리가 있는지 확인 후 뒤로가기
        if (window.history.length > 1) {
            router.back();
        } else {
            // 히스토리가 없으면 홈으로 리다이렉트
            router.push('/');
        }
    };

    const handleSubmit = () => {
        // 작성 로직 구현
        console.log('게시글 작성');
    };

    return (
        <div className="w-full h-full bg-[#ccc] flex p-[10px]">
            <div className="bg-[#fff] w-full h-full rounded-lg p-4 flex-col flex gap-[5px]">
                <h1 className="text-2xl font-bold mb-2 text-[#000]">게시글 작성</h1>

                <div className="flex-5 flex bg-transparent flex flex-col">
                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">제목</p>
                        <input className="w-full border-gray-300 border text-[#000] p-1" />
                    </div>
                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">닉네임</p>
                        <input className="w-full border-gray-300 border text-[#000] p-1" />
                    </div>
                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">비밀번호</p>
                        <input type="password" className="w-full border-gray-300 border text-[#000] p-1" />
                    </div>

                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">내용</p>
                        <SlateTextEditor />
                    </div>

                    <div className="flex justify-center gap-[80px] mt-4">
                        <button 
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            작성
                        </button>
                        <button 
                            onClick={handleGoBack}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            뒤로가기
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex bg-[#dad]"></div>
            </div>
        </div>
    )
}