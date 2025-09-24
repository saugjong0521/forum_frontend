'use client'

import React from "react";
import { useUserInfoStore } from "../../store/useUserInfoStore";
import { useSignIn } from "../../hooks/useSignIn";
import Link from "next/link";

const UserInfoBox = () => {
    const { nickname, email } = useUserInfoStore();
    const { handleSignOut } = useSignIn();

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="flex w-full justify-between">
                <div className="flex-col flex">
                    <div>
                        <div className="text-sm text-gray-700">닉네임</div>
                        <div className="text-base font-medium text-black">{nickname || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-700">이메일</div>
                        <div className="text-base font-medium text-black">{email || '-'}</div>
                    </div>
                </div>
                <div className="">
                    <Link href="/activity" className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">최근 활동</Link>
                </div>
            </div>

            {/* 로그아웃 버튼 */}
            <button
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
                로그아웃
            </button>
        </div>
    );
}

export default UserInfoBox;
