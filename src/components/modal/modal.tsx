import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

interface LogoutModalProps {
  show: boolean;
  onClose: () => void;
}

function LogoutModal({ show, onClose }: LogoutModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get('/api/logout');
    } catch {
      // 로그아웃은 에러가 발생해도 진행
    }
    dispatch(logout());
    onClose();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      id="logoutModal"
      tabIndex={-1}
      role="dialog"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">로그아웃</h5>
            <button className="close" type="button" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">로그아웃 하시겠습니까?</div>
          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={onClose}>
              취소
            </button>
            <button className="btn btn-primary" type="button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
