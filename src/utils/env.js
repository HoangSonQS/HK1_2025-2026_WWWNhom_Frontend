/**
 * Environment Variables Helper
 * Utility để truy cập và validate biến môi trường
 */

/**
 * Lấy giá trị biến môi trường với giá trị mặc định
 * @param {string} key - Tên biến (không cần prefix VITE_)
 * @param {any} defaultValue - Giá trị mặc định nếu không tìm thấy
 * @returns {string}
 */
export const getEnv = (key, defaultValue = '') => {
    const value = import.meta.env[key];
    return value || defaultValue;
};

/**
 * Lấy API Base URL
 */
export const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:6789/api/';
};

/**
 * Lấy Frontend URL
 */
export const getFrontendUrl = () => {
    return import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
};

/**
 * Kiểm tra xem có phải môi trường development không
 */
export const isDev = () => {
    return import.meta.env.DEV;
};

/**
 * Kiểm tra xem có phải môi trường production không
 */
export const isProd = () => {
    return import.meta.env.PROD;
};

/**
 * Lấy mode hiện tại (development, production, etc.)
 */
export const getMode = () => {
    return import.meta.env.MODE;
};

// Export tất cả biến môi trường để dễ debug
export const env = {
    API_BASE_URL: getApiBaseUrl(),
    FRONTEND_URL: getFrontendUrl(),
    APP_NAME: getEnv('VITE_APP_NAME', 'SEBook'),
    MODE: getMode(),
    DEV: isDev(),
    PROD: isProd(),
};

