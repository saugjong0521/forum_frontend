'use client'

import React from 'react';
import SignInBox from '../components/SignInBox';
import UserInfoBox from '../components/UserInfoBox';
import { useSessionUserStore } from '../store/useUserInfoStore';
import { useSessionTokenStore } from '../store/useSessionTokenStore';

const AuthPanel = () => {
  const { nickname, email } = useSessionUserStore();
  const { token } = useSessionTokenStore();

  const isLoggedIn = Boolean(token)

  return isLoggedIn ? <UserInfoBox /> : <SignInBox />;
};

export default AuthPanel;