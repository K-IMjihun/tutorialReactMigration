export interface Post {
  postId: number;
  userName: string;
  title: string;
  createdAt: string;
  commentCount: number;
}

export interface PostListResponse {
  postList: Post[];
  currentPage: number;
  totalPages: number;
}

export interface FileInfo {
  fileId: number;
  fileUrl: string;
  fileSize: number;
}

export interface PostDetail {
  postId: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  files: FileInfo[];
}

export interface Comment {
  commentId: number;
  userId: number;
  nickname: string;
  commentContent: string;
  parentCommentId: number;
  parentNickname: string | null;
  depth: number;
  isDeleted: number;
  createdAt: string;
}
