'use client';

import { useRef, useState } from 'react';
import { SlateTextEditor, } from "@/app/components";
import { useRouter } from 'next/navigation';
import { SlateTextEditorRef } from './SlateTextEditor';
import { useUploadPost } from '../hooks/useUploadPost';
import { useUserInfoStore } from '../store/useUserInfoStore';

export default function WritePostBox() {
    const router = useRouter();
    const editorRef = useRef<SlateTextEditorRef>(null);
    const { uploadPost, loading, error } = useUploadPost();
    const { username } = useUserInfoStore();

    // 폼 상태 관리
    const [title, setTitle] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    const handleSubmit = async () => {
        // 유효성 검사
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        // 에디터에서 HTML 콘텐츠 가져오기
        const content = editorRef.current?.getHTML() || '';

        if (!content.trim() || content === '<p></p>' || content === '<br />') {
            alert('내용을 입력해주세요.');
            return;
        }

        // 훅에 필요한 파라미터만 전달 (패스워드는 없으면 빈 문자열)
        const result = await uploadPost({
            title,
            content,
            password: password.trim() || '', // 빈 문자열이면 그대로 빈 문자열
            // board_id는 선택적이므로 생략 (훅에서 기본값 0 사용)
        });

        if (result) {
            alert('게시글이 성공적으로 작성되었습니다!');

            // 폼 초기화
            setTitle('');
            setNickname('');
            setPassword('');
            editorRef.current?.clear();

            // 게시글 목록으로 이동
            router.push('/board');
        } else if (error) {
            alert(error);
        }
    };

    return (
        <div className="w-full h-full bg-[#ccc] flex p-[10px]">
            <div className="bg-[#fff] w-full h-full rounded-lg p-4 flex-col flex gap-[5px]">
                <h1 className="text-2xl font-bold mb-2 text-[#000]">게시글 작성</h1>


                <div className="flex-5 flex bg-transparent flex flex-col">
                    {/* 제목 입력 */}
                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">제목</p>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full border-gray-300 border text-[#000] p-1 rounded"
                            disabled={isSubmitting || loading}
                        />
                    </div>

                    {/* 닉네임 표시 */}
                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">닉네임</p>
                        <div className="w-full border-gray-300 border text-[#000] p-1 rounded bg-gray-100">
                            {username || '로그인이 필요합니다'}
                        </div>
                    </div>

                    {/* 비밀번호 입력 (선택사항) */}
                    <div className="flex w-full items-center gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] h-full items-center flex p-2">비밀번호 (선택)</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요 (선택사항)"
                            className="w-full border-gray-300 border text-[#000] p-1 rounded"
                            disabled={isSubmitting || loading}
                        />
                    </div>

                    {/* 내용 입력 (에디터) */}
                    <div className="flex w-full gap-[20px] px-4">
                        <p className="text-[#fff] w-[180px] bg-[#aaa] items-start flex p-2">내용</p>
                        <div className="w-full p-1">
                            <SlateTextEditor ref={editorRef} />
                        </div>
                    </div>

                    {/* 버튼들 */}
                    <div className="flex justify-center gap-[80px] mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || loading}
                            className={`px-6 py-2 text-white rounded font-medium transition-colors ${isSubmitting || loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            {isSubmitting || loading ? '작성 중...' : '작성'}
                        </button>
                        <button
                            onClick={handleGoBack}
                            disabled={isSubmitting || loading}
                            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
                        >
                            뒤로가기
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex bg-[#dad]"></div>
            </div>
        </div>
    )
}