// signup/page.tsx
import { SignUpBox } from '@/app/components';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">회원가입</h1>
        <SignUpBox />
      </div>
    </div>
  );
}