// page.tsx
import { Suspense } from 'react';
import AdminUserCli from '../../common/AdminUserCli';


const UserAdmin = () => {

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <div className="w-full h-full flex gap-4 p-4">
                <Suspense fallback={
                    <div className="w-full h-full flex gap-4">
                        <div className="w-1/2 h-full flex flex-col">
                            <div className="flex gap-[15px] mb-2">
                                <div className="px-4 py-2 bg-gray-200 rounded">게시글</div>
                                <div className="px-4 py-2 bg-gray-200 rounded">댓글</div>
                            </div>
                            <div className="flex-1 bg-white border border-gray-300 rounded p-4">
                                <div className="text-center text-gray-500">로딩 중...</div>
                            </div>
                        </div>
                        <div className="w-1/2 h-full bg-white border border-gray-300 rounded p-4">
                            <div className="text-center text-gray-500">로딩 중...</div>
                        </div>
                    </div>
                }>
                    <AdminUserCli />
                </Suspense>
            </div>
        </div>
    );
};

export default UserAdmin;