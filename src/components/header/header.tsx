import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import LogoutModal from '../modal/modal';
import profileImg from '../../assets/img/undraw_profile.svg';

function Header() {
  const { isAuthenticated, username } = useAppSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        <form className="form-inline">
          <button
            id="sidebarToggleTop"
            className="btn btn-link d-md-none rounded-circle mr-3"
            type="button"
          >
            <i className="fa fa-bars"></i>
          </button>
        </form>

        <ul className="navbar-nav ml-auto">
          <div className="topbar-divider d-none d-sm-block"></div>

          <li className="nav-item dropdown no-arrow">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="userDropdown"
              role="button"
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                {isAuthenticated ? username : 'guest'}
              </span>
              <img
                className="img-profile rounded-circle"
                src={profileImg}
                alt="profile"
              />
            </a>

            {isAuthenticated && dropdownOpen && (
              <div
                className="dropdown-menu dropdown-menu-right shadow animated--grow-in show"
                aria-labelledby="userDropdown"
              >
                <a className="dropdown-item" href="#">
                  <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                  Profile
                </a>
                <div className="dropdown-divider"></div>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                  Logout
                </a>
              </div>
            )}
          </li>
        </ul>
      </nav>

      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}

export default Header;
