import React from 'react';
import { SignUpBox } from '../components';

function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">회원가입</h1>
        <SignUpBox />
      </div>
    </div>
  );
}

export default SignUp; 