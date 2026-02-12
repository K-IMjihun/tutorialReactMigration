import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/sidebar';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';

function MainLayout() {
  return (
    <div id="wrapper">
      <Sidebar />

      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Header />

          <div className="container-fluid">
            <Outlet />
          </div>
        </div>

        <Footer />
      </div>

      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
    </div>
  );
}

export default MainLayout;
