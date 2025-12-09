import axios from 'axios';
import { getApiBaseUrl } from '../utils/env';
import { STORAGE_KEYS, ROUTES } from '../utils/constants';

// API Client riêng cho staff - sử dụng staffToken thay vì jwtToken
const URLString = getApiBaseUrl();
const staffClient = axios.create({
    baseURL: URLString,
});

// Request interceptor for staff client
staffClient.interceptors.request.use(
    (config) => {
        // Ưu tiên lấy staffToken, nếu không có thì fallback sang adminToken (admin có quyền cao nhất)
        let token = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
        if (!token) {
            token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
            if (token) {
                console.log('ℹ️ Using adminToken for staff API request (admin has highest privileges)');
            }
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No Staff token or Admin token found!');
        }
        return config;
    },
    (error) => {
        console.error('❌ Staff Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for staff client
staffClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Kiểm tra cả staffToken và adminToken
            let refreshToken = localStorage.getItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
            let tokenKey = STORAGE_KEYS.STAFF_TOKEN;
            let refreshTokenKey = STORAGE_KEYS.STAFF_REFRESH_TOKEN;
            let redirectRoute = ROUTES.STAFF_LOGIN;
            
            // Nếu không có staffToken, kiểm tra adminToken
            if (!refreshToken) {
                refreshToken = localStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                tokenKey = STORAGE_KEYS.ADMIN_TOKEN;
                refreshTokenKey = STORAGE_KEYS.ADMIN_REFRESH_TOKEN;
                redirectRoute = ROUTES.ADMIN_LOGIN;
            }
            
            if (refreshToken) {
                try {
                    const response = await axios.post(`${getApiBaseUrl()}auth/refresh`, {
                        refreshToken: refreshToken
                    });
                    const newToken = response.data.token || response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;
                    if (newToken) {
                        localStorage.setItem(tokenKey, newToken);
                        if (newRefreshToken) {
                            localStorage.setItem(refreshTokenKey, newRefreshToken);
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return staffClient(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                    window.location.href = redirectRoute;
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                // Nếu đang ở route admin, redirect về admin login, ngược lại về staff login
                const currentPath = window.location.pathname;
                const finalRedirectRoute = currentPath.startsWith('/admin') ? ROUTES.ADMIN_LOGIN : ROUTES.STAFF_LOGIN;
                window.location.href = finalRedirectRoute;
            }
        }
        return Promise.reject(error);
    }
);

export default staffClient;

