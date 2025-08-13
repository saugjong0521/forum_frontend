'use client'

import { useState } from "react"
import { SignData } from "../types/sign"
import { api } from "../api";
import { PATH } from "../constants/path";
import { useSessionTokenStore } from "../store/useSessionTokenStore";
import { useSessionUserStore } from "../store/useUserInfoStore";


const useSignIn = () => {
    const [formData, setFormData] = useState<SignData>({
        username: '',
        email: '',
        password: '',
        nickname: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const setToken = useSessionTokenStore((state) => state.setToken)
    const setUserInfo = useSessionUserStore((state) => state.setUserInfo)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { username, password } = formData;

            // URLSearchParams를 이용하여 x-www-form-urlencoded 생성
            const body = new URLSearchParams();
            body.append('username', username);
            body.append('password', password);

            const res = await api.post(PATH.SIGNIN, body.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const sessionToken = res.data?.access_token;

            if (sessionToken) {
                setToken(sessionToken);

                // Bearer 토큰 포함하여 사용자 정보 요청
                const userRes = await api.get(PATH.USERINFO, {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                });

                const userInfo = userRes.data;

                // Zustand store에 사용자 정보 저장
                setUserInfo(userInfo);
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };


    return {
        formData,
        handleChange,
        handleSubmit,
        loading,
        error,
        success,
    };
};

export { useSignIn }