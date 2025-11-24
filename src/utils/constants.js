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
};

export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwtToken',
  REFRESH_TOKEN: 'refreshToken',
  RESET_USERNAME: 'resetUsername',
};

