import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MainPage from './pages/main/MainPage';
import LoginPage from './pages/login/LoginPage';
import MembershipPage from './pages/membership/MembershipPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MainPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/membership" element={<MembershipPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
