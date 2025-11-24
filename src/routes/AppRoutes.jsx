import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/user/components/Login';
import AdminLogin from '../features/user/components/AdminLogin';
import Register from '../features/user/components/Register';
import ForgotPassword from '../features/user/components/ForgotPassword';
import ResetPassword from '../features/user/components/ResetPassword';
import ChangePassword from '../features/user/components/ChangePassword';
import UpdateAccount from '../features/user/components/UpdateAccount';
import Home from '../pages/Home';
import BooksPage from '../pages/BooksPage';
import BookDetailPage from '../pages/BookDetailPage';
import AddBookPage from '../pages/AddBookPage';
import EditBookPage from '../pages/EditBookPage';
import CategoriesPage from '../pages/CategoriesPage';
import AddCategoryPage from '../pages/AddCategoryPage';
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
      
      {/* Books routes - Public */}
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      
      {/* Protected routes */}
      <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
      <Route path={ROUTES.UPDATE_ACCOUNT} element={<UpdateAccount />} />
      
      {/* Admin/Staff routes - Books */}
      <Route path="/books/add" element={<AddBookPage />} />
      <Route path="/books/:id/edit" element={<EditBookPage />} />
      
      {/* Admin/Staff routes - Categories */}
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/add" element={<AddCategoryPage />} />
      
      {/* Default route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;

