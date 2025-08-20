// types/user.ts

export interface UserType {
  username: string;
  email: string;
  nickname: string;
  user_id: number;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignData {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

