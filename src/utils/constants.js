/**
 * Constants - Các hằng số dùng chung trong ứng dụng
 * Lấy từ biến môi trường hoặc giá trị mặc định
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6789/api/';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SEBook';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  ADMIN_LOGIN: '/admin/login',
  STAFF_LOGIN: '/staff/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  STAFF_DASHBOARD: '/staff/dashboard',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/password/forgot',
  RESET_PASSWORD: '/password/reset',
  CHANGE_PASSWORD: '/profile/change-password',
  UPDATE_ACCOUNT: '/profile/update-account',
  BOOKS: '/books',
  BOOK_DETAIL: '/books/:id',
  BOOK_ADD: '/books/add',
  BOOK_EDIT: '/books/:id/edit',
  CATEGORIES: '/categories',
  CATEGORY_ADD: '/categories/add',
  CART: '/cart',
  CHECKOUT: '/checkout',
  MY_ORDERS: '/my-orders',
  ORDER_DETAIL: '/orders/:id',
  NOTIFICATIONS: '/notifications',
  PAYMENT_RESULT: '/payment-result',
};

export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwtToken', // Token cho public (customer only)
  STAFF_TOKEN: 'staffToken', // Token riêng cho staff (seller, warehouse)
  ADMIN_TOKEN: 'adminToken', // Token riêng cho admin
  REFRESH_TOKEN: 'refreshToken',
  STAFF_REFRESH_TOKEN: 'staffRefreshToken', // Refresh token riêng cho staff
  ADMIN_REFRESH_TOKEN: 'adminRefreshToken', // Refresh token riêng cho admin
  RESET_USERNAME: 'resetUsername',
  RETURN_URL: 'returnUrl', // Key for storing return URL
};

