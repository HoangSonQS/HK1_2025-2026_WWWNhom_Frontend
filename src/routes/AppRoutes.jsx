import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/user/components/Login';
import AdminLogin from '../features/user/components/AdminLogin';
import Register from '../features/user/components/Register';
import ForgotPassword from '../features/user/components/ForgotPassword';
import ResetPassword from '../features/user/components/ResetPassword';
import ChangePassword from '../features/user/components/ChangePassword';
import Home from '../pages/Home';
import AdminDashboard from '../pages/AdminDashboard';
import { ROUTES } from '../utils/constants';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
      <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      
      {/* Protected routes */}
      <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
      
      {/* Default route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;

