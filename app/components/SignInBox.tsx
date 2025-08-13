'use client'

import { useSignIn } from "../hooks/useSignIn";

const SignInBox = () => {
    const { formData, handleChange, handleSubmit, loading, error, success } = useSignIn();

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">아이디</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="아이디를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                />
            </div>
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">비밀번호</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
                {loading ? "로그인 중..." : "로그인"}
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        </form>
    );
}

export default SignInBox;
