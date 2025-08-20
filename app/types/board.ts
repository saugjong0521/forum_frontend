// types/board.ts

// 작성자 정보 (API 응답과 일치)
export interface Author {
    user_id: number;
    username: string;
    nickname: string;
    created_at: string;
}

// 게시판 정보 (API 응답과 일치)
export interface Board {
    slug: string;
    name: string;
    description: string;
    board_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

// 댓글 정보 (API 응답과 일치, children 타입 수정)
export interface Comment {
    content: string;
    parent_id: number | null;
    comment_id: number;
    post_id: number;
    author_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    author: Author;
    children: Comment[]; // API는 string[] 이지만 실제 사용시 Comment[]
}

// 게시글 정보 (API 응답과 일치, board 필드 추가)
export interface Post {
    post_id: number;        // 첫 번째로 이동
    title: string;
    board_id: number;
    author_id: number;
    view_count: number;
    like_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    author: Author;         // 필수 (API 응답에 포함)
    board: Board;           // 필수 (API 응답에 포함)
    
    content?: string;       // optional (목록 조회시 없음)
    password?: string;      // optional (보안상 없음)
    comments?: Comment[];   // optional (상세 조회시만)
}

export interface UploadPostType {
    title: string;
    content: string;
    password: string;
    board_id?: number;
}

export interface UploadCommentType {
    content: string;
    post_id: number;
    parent_id?: number;
}

export interface DeactivePostType {
  post_id: number;
}

// types/board.ts에 추가
export interface GetBoardParams {
  skip?: number;
  limit?: number;
  is_active?: boolean | null;
  board_id?: number | null;
  sort_by?: string;
  sort_order?: string;
}

// types/board.ts에 추가
export interface GetPostParams {
  post_id: number;
  password?: number;
}

export interface RecentBoardType {
  showHeader?: boolean; // 테이블 헤더 표시 여부 (기본값: true)
  showTitle?: boolean;  // 컴포넌트 제목 표시 여부 (기본값: true)
  limit?: number;       // 게시글 개수 (기본값: 5)
  titleMaxLength?: number; // 제목 최대 길이 (기본값: 15)
}

export interface BoardPostsState {
  // 게시판 설정
  currentBoardId: number | null;
  postsPerPage: number;
  
  // 페이지네이션
  currentPage: number;
  hasNextPage: boolean;
  
  // 정렬 설정
  sortBy: string;
  sortOrder: string;
  
  // 게시글 데이터
  posts: Post[];
  loading: boolean;
  error: string | null;
}