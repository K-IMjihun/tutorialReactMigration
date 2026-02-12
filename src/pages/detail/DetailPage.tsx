import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAppSelector } from '../../store/hooks';
import type { PostDetail, Comment } from '../../types/post';

function escapeHtml(text: string) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return (
    d.getFullYear() + '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
    ('0' + d.getDate()).slice(-2) + ' ' +
    ('0' + d.getHours()).slice(-2) + ':' +
    ('0' + d.getMinutes()).slice(-2)
  );
}

function DetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAppSelector((state) => state.auth);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');

  // 답글/수정 폼 상태
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; depth: number; nickname: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const replyRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // 현재 로그인 유저 ID (간이: username 기반으로 비교하지 않고 userId 비교)
  // 실제로는 서버에서 currentUserId를 받아와야 하지만, 여기서는 Redux에 저장된 정보 활용
  const currentUserId = useAppSelector((state) => state.auth.username);

  const loadPost = useCallback(async () => {
    try {
      const response = await axios.get<PostDetail>(`/api/post/${postId}/detail`);
      setPost(response.data);
    } catch {
      alert('게시글 정보를 불러올 수 없습니다.');
      navigate('/');
    }
  }, [postId, navigate]);

  const loadComments = useCallback(async () => {
    try {
      const response = await axios.get<Comment[]>(`/api/post/${postId}/comment`);
      setComments(response.data);
    } catch {
      console.error('댓글 목록을 불러오는데 실패했습니다.');
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [loadPost, loadComments]);

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      const response = await axios.delete<{ success: boolean; message?: string }>(`/api/post/${postId}`);
      if (response.data.success) {
        alert('삭제되었습니다.');
        navigate('/');
      } else {
        alert(response.data.message || '삭제에 실패했습니다.');
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 댓글 등록
  const handleSubmitComment = async (parentCommentId: number, depth: number) => {
    const content = parentCommentId === 0 ? commentContent : replyContent;
    // 답글인 경우 닉네임 접두사 제거
    let actualContent = content;
    if (parentCommentId !== 0 && replyTarget) {
      const prefix = '@' + replyTarget.nickname + ' ';
      if (content.startsWith(prefix)) {
        actualContent = content.substring(prefix.length);
      }
    }

    if (!actualContent || !actualContent.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('commentContent', actualContent);
      params.append('parentCommentId', String(parentCommentId));
      params.append('depth', String(depth));

      const response = await axios.post<Comment[]>(`/api/post/${postId}/comment`, params);
      setComments(response.data);
      if (parentCommentId === 0) {
        setCommentContent('');
      } else {
        setReplyTarget(null);
        setReplyContent('');
      }
    } catch (error) {
      handleCommentError(error, '등록');
    }
  };

  // 댓글 수정
  const handleSubmitEdit = async (commentId: number) => {
    const target = comments.find((c) => c.commentId === commentId);
    let actualContent = editContent;
    if (target?.parentNickname) {
      const prefix = '@' + target.parentNickname + ' ';
      if (editContent.startsWith(prefix)) {
        actualContent = editContent.substring(prefix.length);
      }
    }

    if (!actualContent || !actualContent.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('commentContent', actualContent);

      const response = await axios.put<Comment[]>(`/api/post/${postId}/comment/${commentId}`, params);
      setComments(response.data);
      setEditTarget(null);
      setEditContent('');
    } catch (error) {
      handleCommentError(error, '수정');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const response = await axios.delete<Comment[]>(`/api/post/${postId}/comment/${commentId}`);
      setComments(response.data);
    } catch (error) {
      handleCommentError(error, '삭제');
    }
  };

  // 댓글 에러 처리
  const handleCommentError = (error: unknown, action: string) => {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      alert(action === '등록' ? '로그인이 필요합니다.' : action + ' 권한이 없습니다.');
    } else {
      alert('댓글 ' + action + '에 실패했습니다.');
    }
  };

  // 답글 폼 열기
  const openReplyForm = (commentId: number, depth: number, nickname: string) => {
    setEditTarget(null);
    setReplyTarget({ commentId, depth, nickname });
    const prefix = '@' + nickname + ' ';
    setReplyContent(prefix);
    setTimeout(() => {
      if (replyRef.current) {
        replyRef.current.focus();
        replyRef.current.selectionStart = prefix.length;
        replyRef.current.selectionEnd = prefix.length;
      }
    }, 0);
  };

  // 수정 폼 열기
  const openEditForm = (c: Comment) => {
    setReplyTarget(null);
    setEditTarget(c.commentId);
    const value = c.parentNickname
      ? '@' + c.parentNickname + ' ' + c.commentContent
      : c.commentContent;
    setEditContent(value);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  // 폼 취소
  const cancelForm = () => {
    setReplyTarget(null);
    setReplyContent('');
    setEditTarget(null);
    setEditContent('');
  };

  // textarea 닉네임 접두사 보호
  const handleProtectedKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    prefixLength: number
  ) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (e.key === 'Backspace') {
      if (start <= prefixLength && start === end) {
        e.preventDefault();
        return;
      }
      if (start < prefixLength) {
        e.preventDefault();
        textarea.selectionStart = prefixLength;
        return;
      }
    }
    if (e.key === 'Delete' && start < prefixLength) {
      e.preventDefault();
      textarea.selectionStart = prefixLength;
      textarea.selectionEnd = Math.max(end, prefixLength);
      return;
    }
    if (start < prefixLength && !e.ctrlKey && !e.metaKey && e.key.length === 1) {
      e.preventDefault();
      textarea.selectionStart = prefixLength;
      textarea.selectionEnd = Math.max(end, prefixLength);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      textarea.selectionStart = prefixLength;
      if (!e.shiftKey) textarea.selectionEnd = prefixLength;
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      textarea.selectionStart = prefixLength;
      textarea.selectionEnd = textarea.value.length;
      return;
    }
  };

  const handleProtectedClick = (
    e: React.MouseEvent<HTMLTextAreaElement>,
    prefixLength: number
  ) => {
    const textarea = e.currentTarget;
    if (textarea.selectionStart < prefixLength) {
      textarea.selectionStart = prefixLength;
    }
    if (textarea.selectionEnd < prefixLength) {
      textarea.selectionEnd = prefixLength;
    }
  };

  if (!post) return null;

  const isMyPost = isAuthenticated && currentUserId && String(post.userId) === currentUserId;

  return (
    <>
      <h1 className="h3 mb-2 text-gray-800">게시판</h1>

      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="card shadow mb-4">
            {/* 제목 + 수정/삭제 버튼 */}
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary btn float-left">
                {post.title}
              </h6>
              {isMyPost && (
                <div className="float-right">
                  <button
                    type="button"
                    className="btn btn-danger btn"
                    onClick={handleDeletePost}
                  >
                    삭제
                  </button>
                  <Link
                    to={`/post/${post.postId}/edit`}
                    className="btn btn-primary btn ml-1"
                  >
                    수정
                  </Link>
                </div>
              )}
            </div>

            {/* 게시글 본문 */}
            <div
              className="card-body"
              dangerouslySetInnerHTML={{
                __html: escapeHtml(post.content).replace(/\n/g, '<br>'),
              }}
            />

            {/* 첨부파일 */}
            {post.files && post.files.length > 0 && (
              <div className="card-body border-top">
                <h6 className="font-weight-bold">
                  <i className="fas fa-paperclip"></i> 첨부파일
                </h6>
                <ul className="list-unstyled mb-0">
                  {post.files.map((file) => {
                    if (!file.fileUrl) return null;
                    const fileName = file.fileUrl.substring(file.fileUrl.indexOf('_') + 1);
                    const fileSizeKB = (file.fileSize / 1024).toFixed(1);
                    return (
                      <li key={file.fileId} className="mb-1">
                        <a href={`/api/files/${file.fileId}/download`}>
                          <i className="fas fa-file"></i> {fileName}
                        </a>{' '}
                        <small className="text-muted">({fileSizeKB} KB)</small>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 댓글 영역 */}
            <div className="card-footer">
              <div style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}>
                {comments.length === 0 ? (
                  <p className="text-muted p-2">댓글이 없습니다.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.commentId}>
                      <div
                        className="border-bottom py-2"
                        style={{ marginLeft: c.depth * 30 + 'px' }}
                      >
                        {c.isDeleted === 1 ? (
                          <p className="text-muted mb-0" style={{ fontStyle: 'italic' }}>
                            삭제된 댓글입니다.
                          </p>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{escapeHtml(c.nickname)}</strong>
                                <small className="text-muted ml-2">{formatDate(c.createdAt)}</small>
                              </div>
                              <div>
                                {isAuthenticated && (
                                  <a
                                    href="#"
                                    className="text-secondary mx-1 small"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openReplyForm(c.commentId, c.depth, c.nickname);
                                    }}
                                  >
                                    답글
                                  </a>
                                )}
                                {isAuthenticated && currentUserId && String(c.userId) === currentUserId && (
                                  <a
                                    href="#"
                                    className="text-secondary mx-1 small"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openEditForm(c);
                                    }}
                                  >
                                    수정
                                  </a>
                                )}
                                {isAuthenticated && currentUserId &&
                                  (String(c.userId) === currentUserId || String(post.userId) === currentUserId) && (
                                    <a
                                      href="#"
                                      className="text-secondary mx-1 small"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteComment(c.commentId);
                                      }}
                                    >
                                      삭제
                                    </a>
                                  )}
                              </div>
                            </div>

                            {/* 수정 폼 또는 댓글 내용 */}
                            {editTarget === c.commentId ? (
                              <div className="d-flex mt-1">
                                <textarea
                                  ref={editRef}
                                  className="form-control"
                                  rows={2}
                                  maxLength={255}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (c.parentNickname) {
                                      handleProtectedKeyDown(e, ('@' + c.parentNickname + ' ').length);
                                    }
                                  }}
                                  onClick={(e) => {
                                    if (c.parentNickname) {
                                      handleProtectedClick(e, ('@' + c.parentNickname + ' ').length);
                                    }
                                  }}
                                />
                                <button
                                  className="btn btn-primary btn-sm ml-2"
                                  onClick={() => handleSubmitEdit(c.commentId)}
                                >
                                  수정
                                </button>
                                <button className="btn btn-secondary btn-sm ml-1" onClick={cancelForm}>
                                  취소
                                </button>
                              </div>
                            ) : (
                              <p className="mb-0 mt-1">
                                {c.parentNickname
                                  ? '@' + escapeHtml(c.parentNickname) + ' ' + escapeHtml(c.commentContent)
                                  : escapeHtml(c.commentContent)}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* 답글 폼 */}
                      {replyTarget && replyTarget.commentId === c.commentId && (
                        <div
                          className="border-bottom py-2"
                          style={{ marginLeft: (replyTarget.depth + 1) * 30 + 'px' }}
                        >
                          <div className="d-flex">
                            <textarea
                              ref={replyRef}
                              className="form-control"
                              rows={2}
                              maxLength={255}
                              placeholder="대댓글을 입력하세요"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) =>
                                handleProtectedKeyDown(e, ('@' + replyTarget.nickname + ' ').length)
                              }
                              onClick={(e) =>
                                handleProtectedClick(e, ('@' + replyTarget.nickname + ' ').length)
                              }
                            />
                            <button
                              className="btn btn-primary btn-sm ml-2"
                              onClick={() =>
                                handleSubmitComment(replyTarget.commentId, replyTarget.depth + 1)
                              }
                            >
                              등록
                            </button>
                            <button className="btn btn-secondary btn-sm ml-1" onClick={cancelForm}>
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 댓글 입력 폼 */}
              {isAuthenticated && !replyTarget && (
                <div className="d-flex mt-3">
                  <textarea
                    cols={30}
                    rows={3}
                    maxLength={255}
                    className="form-control"
                    style={{ width: '90%' }}
                    placeholder="댓글을 입력하세요"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary ml-2"
                    style={{ width: '9%' }}
                    onClick={() => handleSubmitComment(0, 0)}
                  >
                    등록
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DetailPage;
