"use client"
import { useSessionTokenStore } from "@/app/store/useSessionTokenStore";
import Link from "next/link"


const SignUpComponent = () => {
    const { token } = useSessionTokenStore();

    const isLoggedIn = Boolean(token)


    return (
        isLoggedIn ?
            <></>
            :
            <div className="w-full flex-1 bg-[#fff] rounded-lg p-4 flex items-center justify-center">
                <Link href="/signup" className="w-full">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                        회원가입 하러 가기
                    </button>
                </Link>
            </div>
    )
}

export default SignUpComponent;