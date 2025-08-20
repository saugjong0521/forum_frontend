// hooks/useUploadPost.ts
'use client';

import { useState } from 'react';
import { useSessionTokenStore } from '../store/useSessionTokenStore';
import { PATH } from '../constants/path';
import { api } from '../api';
import { Post, UploadPostType } from '../types/board';

export const useUploadPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSessionTokenStore();

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

  const uploadPost = async (params: UploadPostType): Promise<Post | null> => {
    setLoading(true);
    setError(null);

    // 패스워드 유효성 검사
    const passwordValidation = validatePassword(params.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || '비밀번호가 올바르지 않습니다.');
      setLoading(false);
      return null;
    }

    // 패스워드 처리: 공란이면 null, 아니면 문자열 그대로 전송
    const processedPassword = params.password.trim() === '' 
      ? null 
      : params.password.trim();

    const postData = {
      title: params.title.trim(),
      content: params.content,
      board_id: params.board_id || 2,
      password: processedPassword
    };

    try {
      const response = await api.post(PATH.UPLOADPOST, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data; // Post 타입으로 반환
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시글 작성에 실패했습니다.';
      setError(errorMessage);
      console.error('게시글 작성 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadPost,
    loading,
    error,
  };
};