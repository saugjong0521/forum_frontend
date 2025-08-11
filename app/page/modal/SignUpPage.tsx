
import SignUpBox from "@/app/components/SignUpBox";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8">회원가입</h1>
      <SignUpBox />
    </div>
  );
};

export default SignUpPage;
