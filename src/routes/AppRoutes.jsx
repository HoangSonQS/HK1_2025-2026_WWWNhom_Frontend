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
import EditCategoryPage from '../pages/EditCategoryPage';
import AdminDashboard from '../pages/AdminDashboard';
import AdminHome from '../pages/admin/AdminHome';
import AdminBooksPage from '../pages/admin/AdminBooksPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminAccountsPage from '../pages/admin/AdminAccountsPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import NotificationsPage from '../pages/NotificationsPage';
import { ROUTES } from '../utils/constants';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      
      {/* Admin Dashboard with nested routes */}
      <Route path="/admin" element={<AdminDashboard />}>
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="accounts" element={<AdminAccountsPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Books routes - Public */}
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />
      
      {/* Protected routes */}
      <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePassword />} />
      <Route path={ROUTES.UPDATE_ACCOUNT} element={<UpdateAccount />} />
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
      <Route path={ROUTES.MY_ORDERS} element={<MyOrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
      
      {/* Admin/Staff routes - Books */}
      <Route path="/books/add" element={<AddBookPage />} />
      <Route path="/books/:id/edit" element={<EditBookPage />} />
      
      {/* Admin/Staff routes - Categories */}
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/add" element={<AddCategoryPage />} />
      <Route path="/categories/:id/edit" element={<EditCategoryPage />} />
      
      {/* Default route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;

