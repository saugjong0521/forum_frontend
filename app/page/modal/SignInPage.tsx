

import SignInBox from "@/app/components/SignInBox";
import React from "react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8 text-[#000]">로그인</h1>
      <SignInBox />
    </div>
  );
};

export default SignInPage;
