'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useBringPost from '../hooks/useBringPost';
import BringPostBox from './BringPostBox';
import BringCommentBox from './BringCommentBox';

const PostComponent = () => {
    const params = useParams();
    const router = useRouter();
    const postId = parseInt(params.id as string, 10);
    
    const { post, loading, error, bringPost, resetPost } = useBringPost();
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // 게시글 조회
    useEffect(() => {
        if (postId && !isNaN(postId)) {
            bringPost({ post_id: postId });
        }
    }, [postId, bringPost]);

    // 에러 처리
    useEffect(() => {
        if (error === 'PASSWORD_REQUIRED') {
            setShowPasswordInput(true);
            setPasswordError('');
        } else if (error && error !== 'PASSWORD_REQUIRED') {
            setPasswordError(error);
        }
    }, [error]);

    // 게시글 로딩 성공 시 비밀번호 입력 화면 숨기기
    useEffect(() => {
        if (post && !loading && !error) {
            setShowPasswordInput(false);
            setPasswordError('');
        }
    }, [post, loading, error]);

    // 게시글 로딩 성공 시 비밀번호 입력 화면 숨기기
    useEffect(() => {
        if (post && !loading && !error) {
            setShowPasswordInput(false);
            setPasswordError('');
        }
    }, [post, loading, error]);

    // 비밀번호 입력 처리
    const handlePasswordSubmit = () => {
        if (!password.trim()) {
            setPasswordError('비밀번호를 입력해주세요.');
            return;
        }

        const passwordNum = parseInt(password);
        if (isNaN(passwordNum) || password.length !== 4) {
            setPasswordError('4자리 숫자를 입력해주세요.');
            return;
        }

        bringPost({ post_id: postId, password: passwordNum });
        setPassword('');
    };

    // 뒤로가기
    const handleGoBack = () => {
        router.back();
    };

    // 로딩 상태
    if (loading) {
        return (
            <div className="w-full h-full bg-[#ccc] flex p-[10px]">
                <div className="bg-[#fff] w-full h-full rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">게시글을 불러오는 중...</div>
                </div>
            </div>
        );
    }

    // 비밀번호 입력 화면
    if (showPasswordInput) {
        return (
            <div className="w-full h-full bg-[#ccc] flex p-[10px]">
                <div className="bg-[#fff] w-full h-full rounded-lg flex items-center justify-center">
                    <div className="max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-center mb-4">
                            비밀번호 보호된 게시글
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            이 게시글을 보려면 비밀번호를 입력해주세요.
                        </p>
                        
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                placeholder="4자리 숫자 입력"
                                className="w-full p-3 border border-gray-300 rounded text-center text-lg tracking-widest"
                                maxLength={4}
                            />
                            
                            {passwordError && (
                                <div className="text-red-600 text-sm text-center">
                                    {passwordError}
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleGoBack}
                                    className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    뒤로가기
                                </button>
                                <button
                                    onClick={handlePasswordSubmit}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error && error !== 'PASSWORD_REQUIRED') {
        return (
            <div className="w-full h-full bg-[#ccc] flex p-[10px]">
                <div className="bg-[#fff] w-full h-full rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">{error}</div>
                        <button
                            onClick={handleGoBack}
                            className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            뒤로가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 게시글이 없는 경우
    if (!post) {
        return (
            <div className="w-full h-full bg-[#ccc] flex p-[10px]">
                <div className="bg-[#fff] w-full h-full rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">게시글을 찾을 수 없습니다.</div>
                </div>
            </div>
        );
    }

    // 게시글 표시
    return (
        <div className="w-full h-full bg-[#ccc] flex p-[10px]">
            <div className="bg-[#fff] w-full h-full rounded-lg p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* 뒤로가기 버튼 */}
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            ← 뒤로가기
                        </button>
                    </div>

                    {/* 게시글 박스 */}
                    <BringPostBox post={post} />
                    
                    {/* 댓글 박스 */}
                    <BringCommentBox comments={post.comments} />
                </div>
            </div>
        </div>
    );
};

export default PostComponent;