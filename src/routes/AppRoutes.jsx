import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/user/components/Login';
import AdminLogin from '../features/user/components/AdminLogin';
import StaffLogin from '../features/user/components/StaffLogin';
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
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage';
import AdminPromotionDetailPage from '../pages/admin/AdminPromotionDetailPage';
import AdminPromotionsPage from '../pages/admin/AdminPromotionsPage';
import AdminSuppliersPage from '../pages/admin/AdminSuppliersPage';
import AdminImportStocksPage from '../pages/admin/AdminImportStocksPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import NotificationsPage from '../pages/NotificationsPage';
import PaymentResultPage from '../pages/PaymentResultPage';
import ChatbotPage from '../pages/ChatbotPage';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';
import ProtectedStaffRoute from '../components/ProtectedStaffRoute';
import StaffDashboard from '../pages/StaffDashboard';
import StaffHome from '../pages/staff/StaffHome';
import StaffBooksPage from '../pages/staff/StaffBooksPage';
import StaffStockRequestsPage from '../pages/staff/StaffStockRequestsPage';
import BookImportHistoryPage from '../pages/staff/BookImportHistoryPage';
import StaffCustomersPage from '../pages/staff/StaffCustomersPage';
import StaffCustomerDetailPage from '../pages/staff/StaffCustomerDetailPage';
import StaffReturnRequestsPage from '../pages/staff/StaffReturnRequestsPage';
import StaffReportsPage from '../pages/staff/StaffReportsPage';
import StaffPromotionAnalyticsPage from '../pages/staff/StaffPromotionAnalyticsPage';
import StaffStockCheckPage from '../pages/staff/StaffStockCheckPage';
import StaffWarehouseReturnsPage from '../pages/staff/StaffWarehouseReturnsPage';
import StaffPurchaseOrdersPage from '../pages/staff/StaffPurchaseOrdersPage';
import StaffPromotionsPage from '../pages/staff/StaffPromotionsPage';
import StaffOrdersPage from '../pages/staff/StaffOrdersPage';
import StaffOrderDetailPage from '../pages/staff/StaffOrderDetailPage';
import { ROUTES } from '../utils/constants';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
      <Route path={ROUTES.STAFF_LOGIN} element={<StaffLogin />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      
      {/* Admin Dashboard with nested routes - Protected by adminToken */}
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="accounts" element={<AdminAccountsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="promotions/:id" element={<AdminPromotionDetailPage />} />
        <Route path="suppliers" element={<AdminSuppliersPage />} />
        <Route path="import-stocks" element={<AdminImportStocksPage />} />
        <Route path="customers" element={<StaffCustomersPage />} />
        <Route path="customers/:id" element={<StaffCustomerDetailPage />} />
        <Route path="return-requests" element={<StaffReturnRequestsPage />} />
        <Route path="reports" element={<StaffReportsPage />} />
        <Route path="promotion-analytics" element={<StaffPromotionAnalyticsPage />} />
        <Route path="stock-requests" element={<StaffStockRequestsPage />} />
        <Route path="stock-check" element={<StaffStockCheckPage />} />
        <Route path="warehouse-returns" element={<StaffWarehouseReturnsPage />} />
        <Route path="purchase-orders" element={<StaffPurchaseOrdersPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Staff Dashboard with nested routes - Protected by jwtToken (staff) */}
      <Route 
        path="/staff" 
        element={
          <ProtectedStaffRoute>
            <StaffDashboard />
          </ProtectedStaffRoute>
        }
      >
        <Route path="dashboard" element={<StaffHome />} />
        {/* Seller Staff routes */}
        <Route path="books" element={<StaffBooksPage />} />
        <Route path="books/add" element={<AddBookPage />} />
        <Route path="books/:id/edit" element={<EditBookPage />} />
        <Route path="books/:id/history" element={<BookImportHistoryPage />} />
        <Route path="customers" element={<StaffCustomersPage />} />
        <Route path="customers/:id" element={<StaffCustomerDetailPage />} />
        <Route path="stock-requests" element={<StaffStockRequestsPage />} />
        <Route path="return-requests" element={<StaffReturnRequestsPage />} />
        <Route path="reports" element={<StaffReportsPage />} />
        <Route path="promotion-analytics" element={<StaffPromotionAnalyticsPage />} />
        <Route path="stock-check" element={<StaffStockCheckPage />} />
        <Route path="warehouse-returns" element={<StaffWarehouseReturnsPage />} />
        <Route path="purchase-orders" element={<StaffPurchaseOrdersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<StaffOrdersPage />} />
        <Route path="orders/:id" element={<StaffOrderDetailPage />} />
        <Route path="promotions" element={<StaffPromotionsPage />} />
        <Route path="promotions/:id" element={<AdminPromotionDetailPage />} /> {/* Reusing AdminPromotionDetailPage */}
        {/* Warehouse Staff routes */}
        <Route path="suppliers" element={<AdminSuppliersPage />} />
        <Route path="import-stocks" element={<AdminImportStocksPage />} />
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
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
      <Route path={ROUTES.PAYMENT_RESULT} element={<PaymentResultPage />} />
      <Route path="/chatbot" element={<ChatbotPage />} />
      
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

