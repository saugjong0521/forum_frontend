'use client';

import { useRef, useState } from 'react';
import { SlateTextEditor, } from "@/app/components";
import { useRouter } from 'next/navigation';
import { useUploadPost } from '../../hooks/useUploadPost';
import { useUserInfoStore } from '../../store/useUserInfoStore';
import { useBoardPostStore } from '../../store/useBoardPostStore';
import { SlateTextEditorRef } from '@/app/types/editor';

export default function WritePostBox() {
    const router = useRouter();
    const editorRef = useRef<SlateTextEditorRef>(null);
    const { uploadPost, loading, error } = useUploadPost();
    const { username } = useUserInfoStore();
    const { currentBoardId } = useBoardPostStore();

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

    // 패스워드 유효성 검사 함수
    const validatePassword = (password: string): { isValid: boolean; message?: string } => {
        if (password.trim() === '') {
            return { isValid: true }; // 공란 허용
        }
        
        // 숫자만 포함하는지 확인
        if (!/^\d+$/.test(password)) {
            return { isValid: false, message: '비밀번호는 숫자만 입력 가능합니다.' };
        }
        
        // 4자리인지 확인
        if (password.length !== 4) {
            return { isValid: false, message: '비밀번호는 4자리 숫자여야 합니다.' };
        }
        
        return { isValid: true };
    };

    const handleSubmit = async () => {
        // 제목 유효성 검사
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        // 내용 유효성 검사
        const content = editorRef.current?.getHTML() || '';
        if (!content.trim() || content === '<p></p>' || content === '<br />') {
            alert('내용을 입력해주세요.');
            return;
        }

        // 패스워드 유효성 검사
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            alert(passwordValidation.message || '비밀번호가 올바르지 않습니다.');
            return;
        }

        setIsSubmitting(true);

        try {
            // useUploadPost 훅의 타입에 맞게 데이터 준비
            const postData = {
                title,
                content,
                password: password || '', // 빈 문자열이면 그대로 빈 문자열로
                ...(currentBoardId !== null && { board_id: currentBoardId }) // null이 아닐 때만 포함
            };

            const result = await uploadPost(postData);

            if (result) {
                // 폼 초기화
                setTitle('');
                setNickname('');
                setPassword('');
                editorRef.current?.clear();

                // 게시글 목록으로 이동 (board_id에 따라 경로 결정)
                if (currentBoardId !== null) {
                    router.push(`/board?board_id=${currentBoardId}`);
                } else {
                    router.push('/board');
                }
            } else if (error) {
                alert(error);
            }
        } catch (err) {
            console.error('게시글 작성 중 오류:', err);
            alert('게시글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 패스워드 입력 시 실시간 유효성 검사 (선택사항)
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // 숫자만 입력되도록 필터링 (선택사항)
        if (value === '' || /^\d{0,4}$/.test(value)) {
            setPassword(value);
        }
    };

    // 현재 게시판 정보 표시
    const getCurrentBoardName = () => {
        if (currentBoardId === null) {
            return '전체 게시판';
        }
        // TODO: 게시판 ID에 따른 이름 매핑 (게시판 목록 store가 있다면)
        return `게시판 ${currentBoardId}`;
    };

    return (
        <div className="w-full h-full bg-[#ccc] flex p-[10px]">
            <div className="bg-[#fff] w-full h-full rounded-lg p-4 flex-col flex gap-[5px]">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-[#000]">게시글 작성</h1>
                    <div className="text-sm text-gray-600">
                        작성 위치: {getCurrentBoardName()}
                    </div>
                </div>

                <div className="flex-5 flex bg-transparent flex flex-col px-4">
                    <div className="flex w-full gap-[20px]">
                        {/* 왼쪽 라벨 기둥 */}
                        <div className="w-[180px] bg-[#aaa] rounded flex flex-col">
                            <div className="text-[#fff] h-[44px] flex items-center justify-center">
                                제목
                            </div>
                            <div className="text-[#fff] h-[44px] flex items-center justify-center border-t border-[#999]">
                                닉네임
                            </div>
                            <div className="text-[#fff] h-[44px] flex items-center justify-center border-t border-[#999]">
                                비밀번호
                            </div>
                            <div className="text-[#fff] flex-1 flex items-start justify-center pt-2 border-t border-[#999]">
                                내용
                            </div>
                        </div>

                        {/* 오른쪽 입력 필드들 */}
                        <div className="flex-1 flex flex-col">
                            {/* 제목 입력 */}
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                className="w-full border-gray-300 border text-[#000] p-2 rounded h-[44px]"
                                disabled={isSubmitting || loading}
                            />

                            {/* 닉네임 표시 */}
                            <div className="w-full border-gray-300 border text-[#000] p-2 rounded bg-gray-100 h-[44px] flex items-center mt-px">
                                {username || '로그인이 필요합니다'}
                            </div>

                            {/* 비밀번호 입력 (선택사항) */}
                            <input
                                type="password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="4자리 숫자 또는 공란 (선택사항)"
                                className="w-full border-gray-300 border text-[#000] p-2 rounded h-[44px] mt-px"
                                disabled={isSubmitting || loading}
                                maxLength={4}
                            />

                            {/* 내용 입력 (에디터) */}
                            <div className="flex-1 mt-px">
                                <SlateTextEditor ref={editorRef} />
                            </div>
                        </div>
                    </div>

                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* 버튼들 */}
                    <div className="flex justify-center gap-[80px] mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || loading}
                            className={`px-6 py-3 text-white rounded font-medium transition-colors ${isSubmitting || loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            {isSubmitting || loading ? '작성 중...' : '작성'}
                        </button>
                        <button
                            onClick={handleGoBack}
                            disabled={isSubmitting || loading}
                            className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
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