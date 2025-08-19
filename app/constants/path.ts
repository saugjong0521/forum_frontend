
export const PATH = {
  SIGNUP: "/auth/signup",
  SIGNIN: "/auth/login",
  USERINFO: "/auth/me",
  UPLOADPOST: "/posts",
  GETBOARD: "/posts",
  GETPOST: (id: number) => `/posts/${id}`,
  GETBOARDNAME: "/boards",
  DEACTIVATEPOST: (id: number) => `/posts/${id}/deactivate`,
  UPLOADCOMMENT: (id: number) => `/posts/${id}/comments`,
  GETCOMMENTS: (id: number) => `/posts/${id}/comments`,
  DEACTIVATECOMMENT: (id: number) => `/posts/comments/${id}/deactivate`,
  POSTRECOMMEND: (id: number) => `/posts/${id}/recommend`,
  UNDORECOMMEND: (id: number) => `/posts/${id}/recommend`,
  CHECKRECOMMEND: (id: number) => `/posts/${id}/recommend`
} as const;


