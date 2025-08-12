'use client'

import { useState } from "react"
import { SignData } from "../types/sign"
import { api } from "../api";
import { PATH } from "../constants/path";


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
            await api.post(PATH.SIGNIN, { username, password });
            setSuccess(true);
            setFormData({ username: "", password: "", email: "", nickname: "" });
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