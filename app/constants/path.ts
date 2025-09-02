
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
  CHECKRECOMMEND: (id: number) => `/posts/${id}/recommend`,
  CHECKUSERLIST: "/admin/users",

  ADMINDEACTIVATEPOST: (id: number) => `/admin/posts/${id}/deactivate`,
  ADMINDEACTIVATECOMMENT: (id: number) => `/admin/comments/${id}/deactivate`,
  ADMINDELETEPOST: (id: number) => `/admin/posts/${id}`,
  ADMINDELETECOMMENT: (id: number) => `/admin/comments/${id}`,
  ADMINACTIVATEPOST: (id: number) => `/admin/posts/${id}/activate`,
  ADMINGETCOMMENTS:  (id: number) => `/posts/${id}/comments`,
  ADMINACTIVATECOMMENT: (id: number) => `/admin/comments/${id}/activate`,
  ADMINCOMMENTS: `/admin/comments`,
  ADMINGETUSERS: `/admin/users`,

} as const;


