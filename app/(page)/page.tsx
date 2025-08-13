import Link from "next/link";
import AuthPanel from "../components/AuthPanel";

const MainPage = () => {
    return (
        <div className="w-full h-full flex bg-[#ccc] gap-[10px] p-[10px] box-border">
            <div className="flex-2 h-full flex flex-col gap-[10px]">


                <div className="w-full flex-1 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                    <p className="text-[#000]">광고 배너</p>
                </div>

                <div className="w-full flex-4 bg-[#fff] rounded-lg p-4 flex items-center justify-center">

                </div>
                
                <div className="w-full flex-3 bg-[#fff] rounded-lg p-4 flex items-center justify-center">

                </div>
                
            
            </div>

            <div className="flex-1 h-full flex flex-col gap-[10px]">
                
                
                <div className="w-full flex-2 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                    <AuthPanel />
                </div>
                
                
                <div className="w-full flex-1 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                    <Link href="/signup" className="w-full">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                            회원가입 하러 가기
                        </button>
                    </Link>
                </div>

                <div className="w-full flex-2 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                    
                </div>

                <div className="w-full flex-3 bg-transparent rounded-lg p-4 flex items-center justify-center">
                    
                </div>


            </div>
        </div>
    )
}

export default MainPage;