'use client'

import React from "react";
import { useSessionUserStore } from "../store/useUserInfoStore";

const UserInfoBox = () => {
    const { nickname, email } = useSessionUserStore();

    return (
        <div className="w-full flex flex-col gap-3">
            <div>
                <div className="text-sm text-gray-700">닉네임</div>
                <div className="text-base font-medium text-black">{nickname || '-'}</div>
            </div>
            <div>
                <div className="text-sm text-gray-700">이메일</div>
                <div className="text-base font-medium text-black">{email || '-'}</div>
            </div>
        </div>
    );
}

export default UserInfoBox;