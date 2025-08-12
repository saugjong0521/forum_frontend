'use client'

import React from "react";
import useSignUp from "../hooks/useSignUp";

const SignUpBox = () => {
  const { formData, handleChange, handleSubmit, loading, error, success } = useSignUp();

  return (
    <form className="flex flex-col gap-4 w-full max-w-md" onSubmit={handleSubmit}>
      <label className="flex flex-col">
        <span className="font-semibold mb-1">
          <p className=" text-[#000]">ID</p>
        </span>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="border border-[#000] text-[#000] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex flex-col">
        <span className="font-semibold mb-1">
          <p className=" text-[#000]">Email</p>
        </span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border border-[#000] text-[#000] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex flex-col">
        <span className="font-semibold mb-1">
          <p className=" text-[#000]">Password</p>
        </span>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border border-[#000] text-[#000] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex flex-col">
        <span className="font-semibold mb-1">
          <p className=" text-[#000]">Nickname</p>
        </span>
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          required
          className="border border-[#000] text-[#000] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      {loading && <p className="text-orange-500">회원가입 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">회원가입 성공!</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
      >
        회원가입
      </button>
    </form>
  );
};

export default SignUpBox;
