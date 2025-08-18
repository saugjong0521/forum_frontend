// login/page.tsx
import { SignInBox } from '@/app/components';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">로그인</h1>
        <SignInBox />
      </div>
    </div>
  );
}