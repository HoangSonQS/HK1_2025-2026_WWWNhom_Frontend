import axios from 'axios';
import { getApiBaseUrl } from '../utils/env';
import { STORAGE_KEYS } from '../utils/constants';

// API Client riêng cho admin - sử dụng adminToken thay vì jwtToken
const URLString = getApiBaseUrl();
const adminClient = axios.create({
    baseURL: URLString,
});

// Token config - tự động thêm adminToken vào header
adminClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No admin token found!');
        }
        return config;
    },
    (error) => {
        console.error('❌ Admin Request Error:', error);
        return Promise.reject(error);
    }
);

// Xử lý response - tự động refresh token nếu cần
adminClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
            if (refreshToken) {
                try {
                    const response = await axios.post(`${getApiBaseUrl()}auth/refresh`, {
                        refreshToken: refreshToken
                    });
                    const newToken = response.data.token || response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;
                    if (newToken) {
                        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, newToken);
                        if (newRefreshToken) {
                            localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, newRefreshToken);
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return adminClient(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
                    window.location.href = '/admin/login';
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default adminClient;

