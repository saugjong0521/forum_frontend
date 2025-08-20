'use client'

import { useState } from "react";
import { api } from "../api"; // axios 인스턴스
import { SignData } from "../types/user"; // 타입 import
import { PATH } from "../constants/path";

const useSignUp = () => {
  const [formData, setFormData] = useState<SignData>({
    username: "",
    email: "",
    password: "",
    nickname: "",
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
      await api.post(PATH.SIGNUP, formData); 
      setSuccess(true);
      setFormData({ username: "", email: "", password: "", nickname: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
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

export default useSignUp;
