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
