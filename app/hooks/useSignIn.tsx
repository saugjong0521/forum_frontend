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
    const clearToken = useSessionTokenStore((state) => state.clearToken)
    const setUserInfo = useSessionUserStore((state) => state.setUserInfo)
    const clearUserInfo = useSessionUserStore((state) => state.clearUserInfo)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { username, password } = formData;

            // x-www-form-urlencoded body 생성
            const body = new URLSearchParams();
            body.append('grant_type', '');
            body.append('username', username);
            body.append('password', password);
            body.append('scope', '');
            body.append('client_id', '');
            body.append('client_secret', '');

            const res = await api.post(PATH.SIGNIN, body.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const sessionToken = res.data?.access_token;

            if (sessionToken) {
                setToken(sessionToken);

                // 사용자 정보 요청
                const userRes = await api.get(PATH.USERINFO, {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                });

                setUserInfo(userRes.data);
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        clearToken();
        clearUserInfo();
        setSuccess(false);
    };

    return {
        formData,
        handleChange,
        handleSignIn,
        handleSignOut,
        loading,
        error,
        success,
    };
};

export { useSignIn }
