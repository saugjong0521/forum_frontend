import Link from "next/link";
import AuthPanel from "../components/auth/AuthPanel";
import RecentBoardComponent from "../components/board/RecentBoardComponent";
import SignUpComponent from "../components/auth/SignUpComponent";

const MainPage = () => {
    
    return (
        <div className="w-full h-full flex bg-[#ccc] gap-[10px] p-[10px] box-border">
            <div className="flex-2 h-full flex flex-col gap-[10px]">


                <div className="w-full flex-1 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                    <p className="text-[#000]">광고 배너</p>
                </div>

                <div className="w-full flex-4 bg-[#fff] rounded-lg flex items-center justify-center">
                    <RecentBoardComponent
                        showHeader={true}     // 테이블 헤더 없음
                        showTitle={true}       // 컴포넌트 제목만 표시
                        limit={9}             // 10개 게시글
                        // titleMaxLength={20}
                    />
                </div>

                <div className="w-full flex-3 bg-[#fff] rounded-lg p-4 flex items-center justify-center">

                </div>


            </div>

            <div className="flex-1 h-full flex flex-col gap-[10px]">


                <div className="w-full flex-2 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                    <AuthPanel />
                </div>


                <SignUpComponent />

                <div className="w-full flex-2 bg-[#fff] rounded-lg p-4 flex items-center justify-center">

                </div>

                <div className="w-full flex-3 bg-transparent rounded-lg p-4 flex items-center justify-center">

                </div>


            </div>
        </div>
    )
}

export default MainPage;