import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import LogoutModal from '../modal/modal';

function Sidebar() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <ul
        className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${collapsed ? 'toggled' : ''}`}
        id="accordionSidebar"
      >
        <Link
          className="sidebar-brand d-flex align-items-center justify-content-center"
          to="/"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="sidebar-brand-text mx-3">게시판</div>
        </Link>

        <hr className="sidebar-divider my-0" />

        <li className="nav-item">
          <a
            className="nav-link collapsed"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPagesOpen(!pagesOpen);
            }}
          >
            <i className="fas fa-fw fa-folder"></i>
            <span>Pages</span>
          </a>
          {pagesOpen && (
            <div
              id="collapsePages"
              className="collapse show"
              aria-labelledby="headingPages"
              data-parent="#accordionSidebar"
            >
              <div className="bg-white py-2 collapse-inner rounded">
                <h6 className="collapse-header">Login Screens:</h6>
                {!isAuthenticated ? (
                  <>
                    <Link className="collapse-item" to="/login">Login</Link>
                    <Link className="collapse-item" to="/membership">Membership</Link>
                  </>
                ) : (
                  <a
                    className="collapse-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLogoutModal(true);
                    }}
                  >
                    Logout
                  </a>
                )}
              </div>
            </div>
          )}
        </li>

        <li className="nav-item active">
          <Link className="nav-link" to="/">
            <i className="fas fa-fw fa-table"></i>
            <span>Tables</span>
          </Link>
        </li>

        <hr className="sidebar-divider d-none d-md-block" />

        <div className="text-center d-none d-md-inline">
          <button
            className="rounded-circle border-0"
            id="sidebarToggle"
            onClick={() => setCollapsed(!collapsed)}
          ></button>
        </div>
      </ul>

      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}

export default Sidebar;
