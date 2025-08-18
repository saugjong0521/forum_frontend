
export const PATH = {
  SIGNUP: "/auth/signup",
  SIGNIN: "/auth/login",
  USERINFO: "/auth/me",
  UPLOADPOST: "/posts",
  GETBOARD: "/posts",
  GETPOST: (id: number) => `/posts/${id}`,

} as const;


