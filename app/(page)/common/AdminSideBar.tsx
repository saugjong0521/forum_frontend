"use client"

import Link from "next/link";


const AdminSideBar = () => {

    return (
        <div className="w-full flex flex-col flex-shrink-0 h-[90px] bg-[#fff] text-white">
            <div className="w-full h-full flex items-center gap-[100px] px-[20px]">
                    <Link href="/admin/content" className="p-4">
                        <p className="text-[#000]">content 관리</p>
                    </Link>



            </div>
        </div>
    )
}

export default AdminSideBar;