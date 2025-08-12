'use client'

import { useSignIn } from "../hooks/useSignIn";

const SignInBox = () => {
    const { formData, handleChange, handleSubmit, loading, error, success } = useSignIn();

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64 p-4 border rounded">
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="border p-2 rounded text-[#000] border-[#000]"
                required
            />
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="border p-2 rounded text-[#000] border-[#000]"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">Login successful!</p>}
        </form>
    );
}

export default SignInBox;
