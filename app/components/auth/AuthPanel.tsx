'use client'

import React from 'react';
import SignInBox from './SignInBox';
import UserInfoBox from './UserInfoBox';
import { useUserInfoStore } from '../../store/useUserInfoStore';
import { useSessionTokenStore } from '../../store/useSessionTokenStore';

const AuthPanel = () => {
  const { nickname, email } = useUserInfoStore();
  const { token } = useSessionTokenStore();

  const isLoggedIn = Boolean(token)

  return isLoggedIn ? <UserInfoBox /> : <SignInBox />;
};

export default AuthPanel;