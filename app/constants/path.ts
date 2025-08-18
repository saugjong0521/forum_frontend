
export const PATH = {
  SIGNUP: "/auth/signup",
  SIGNIN: "/auth/login",
  USERINFO: "/auth/me",
  UPLOADPOST: "/posts",
  GETBOARD: "/posts",
  GETPOST: (id: number) => `/posts/${id}`,
  UPLOADCOMMENT: (id: number) => `/posts/${id}/comments`,
  GETBOARDNAME: "/boards"
} as const;


