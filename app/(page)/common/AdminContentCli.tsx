// ContentAdminClient.tsx
'use client';

import { useState } from 'react';
import AdminBoardComponent from "@/app/components/admin/AdminBoardComponent";
import AdminBoardDisplay from "@/app/components/admin/AdminBoardDisplay";
import AdminCommentComponent from '@/app/components/admin/AdminCommentComponent';

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
        <div className='w-full h-full flex gap-[20px]'>
            {/* 좌측 영역 */}
            <div className="w-1/2 h-full flex flex-col">

                {/* 탭 버튼들 */}
                <div className="flex gap-[15px] p-0">
                    <button
                        className={`px-4 rounded h-[25px] transition-colors ${activeTab === 'board'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={handleDisplayBoard}
                    >
                        <p>게시글</p>
                    </button>
                    <button
                        className={`px-4 h-[25px] rounded transition-colors ${activeTab === 'comment'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        onClick={handleDisplayComment}
                    >
                        <p>댓글</p>
                    </button>
                </div>

                {/* 좌측 컨텐츠 */}
                    <div className="w-full h-full">
                        <AdminBoardComponent />
                    </div>

            </div>

            {/* 우측 영역 */}
            <div className="w-1/2 h-full">
                    <AdminBoardDisplay />
            </div>
        </div>
    );
};

export default ContentAdminClient;