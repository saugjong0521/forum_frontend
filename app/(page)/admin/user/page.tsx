import AdminUserBox from "@/app/components/admin/AdminUserBox";


const UserAdmin = () => {

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <div className="w-full h-full flex gap-4 p-4">
                <AdminUserBox />
            </div>
        </div>
    )
}

export default UserAdmin;