'use client'

import { useBoardStore } from "@/app/store/useBoardStore";
import Link from "next/link";
import React from "react";

const Header = () => {
    const { setBoardId } = useBoardStore();

    const handleNoticeClick = () => {
        setBoardId(1); // 공지사항 board_id는 1
    };

    const handleBoardClick = () => {
        setBoardId(2); // 일반 게시판 board_id는 2
    };

    return (
        <div className="w-full flex flex-shrink-0 h-[90px] bg-[#fff] text-white">
            <div className="w-full h-full flex items-center gap-[100px] px-[20px]">

                <div className="items-center h-full flex px-4">
                    <p className="text-[#000]">Logo</p>
                </div>

                <div className="flex gap-4 h-full items-center">
                    <Link href="/" className="p-4">
                        <p className="text-[#000]">홈</p>
                    </Link>

                    <Link href="/board" className="p-4" onClick={handleNoticeClick}>
                        <p className="text-[#000]">공지사항</p>
                    </Link>

                    <Link href="/board" className="p-4" onClick={handleBoardClick}>
                        <p className="text-[#000]">게시판</p>
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Header;