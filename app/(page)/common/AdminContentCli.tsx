// ContentAdminClient.tsx
'use client';

import { useState } from 'react';
import AdminBoardComponent from "@/app/components/admin/AdminBoardComponent";
import AdminBoardDisplay from "@/app/components/admin/AdminBoardDisplay";

type TabType = 'board' | 'comment';

const ContentAdminClient = () => {
    const [activeTab, setActiveTab] = useState<TabType>('board');

    const handleDisplayBoard = () => {
        setActiveTab('board');
    };

    const handleDisplayComment = () => {
        setActiveTab('comment');
    };

    return (
        <>
            {/* 좌측 영역 */}
            <div className="w-1/2 h-full flex flex-col">

                {/* 탭 버튼들 */}
                <div className="flex h-full gap-[15px] p-2">
                    <button
                        className={`px-4 rounded transition-colors ${activeTab === 'board'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={handleDisplayBoard}
                    >
                        <p>게시글</p>
                    </button>
                    <button
                        className={`px-4 rounded transition-colors ${activeTab === 'comment'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={handleDisplayComment}
                    >
                        <p>댓글</p>
                    </button>
                </div>

                {/* 좌측 컨텐츠 */}
                {activeTab === 'board' ? (
                    <AdminBoardComponent />
                ) : (
                    <div className="flex-1 bg-white border border-gray-300 rounded p-4">
                        <div className="text-center text-gray-500">댓글 관리 영역 (준비중)</div>
                    </div>
                )}
            </div>

            {/* 우측 영역 */}
            <div className="w-1/2 h-full">
                {activeTab === 'board' ? (
                    <AdminBoardDisplay />
                ) : (
                    <div className="h-full bg-white border border-gray-300 rounded p-4">
                        <div className="text-center text-gray-500">댓글 상세 영역 (준비중)</div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ContentAdminClient;