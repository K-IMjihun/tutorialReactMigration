import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { api } from '../../services/api';
import type { PostListResponse } from '../../types/post';

const PAGE_SIZE = 10;

function MainPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [postList, setPostList] = useState<PostListResponse['postList']>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadPostList = useCallback(async (page: number) => {
    try {
      const response = await api.get<PostListResponse>('/post', {
        page: String(page),
        size: String(PAGE_SIZE),
      });
      setPostList(response.postList);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('게시글 목록 로딩 실패:', error);
    }
  }, []);

  useEffect(() => {
    loadPostList(1);
  }, [loadPostList]);

  const goToWrite = () => {
    if (isAuthenticated) {
      navigate('/post/write');
    } else {
      if (confirm('로그인 하시겠습니까?')) {
        navigate('/login');
      }
    }
  };

  // 페이지네이션 계산
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, Math.max(startPage + 4, Math.min(totalPages, currentPage + 2)));
  const adjustedStartPage = Math.max(1, endPage - 4);
  const pageNumbers = [];
  for (let i = adjustedStartPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <h1 className="h3 mb-2 text-gray-800">게시판</h1>

      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing={0}>
              <colgroup>
                <col width="20%" />
                <col width="40%" />
                <col width="30%" />
                <col width="20%" />
              </colgroup>
              <thead>
                <tr>
                  <th>닉네임</th>
                  <th>제목</th>
                  <th>날짜</th>
                  <th>댓글</th>
                </tr>
              </thead>
              <tbody>
                {postList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center">
                      게시글이 없습니다.
                    </td>
                  </tr>
                ) : (
                  postList.map((post) => (
                    <tr key={post.postId}>
                      <td>{post.userName}</td>
                      <td>
                        <Link to={`/post/${post.postId}`}>{post.title}</Link>
                      </td>
                      <td>{post.createdAt ? post.createdAt.split('T')[0] : ''}</td>
                      <td>{post.commentCount ?? 0}개</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 0 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => loadPostList(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      이전
                    </button>
                  </li>
                  {pageNumbers.map((page) => (
                    <li
                      key={page}
                      className={`page-item ${page === currentPage ? 'active' : ''}`}
                    >
                      <button className="page-link" onClick={() => loadPostList(page)}>
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => loadPostList(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </button>
                  </li>
                </ul>
              </nav>
            )}

            <button
              type="button"
              className="btn btn-primary btn float-right"
              onClick={goToWrite}
            >
              게시글 작성
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainPage;
