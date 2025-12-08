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
        const token = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('⚠️ No Staff token found!');
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
            const refreshToken = localStorage.getItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
            if (refreshToken) {
                try {
                    const response = await axios.post(`${getApiBaseUrl()}auth/refresh`, {
                        refreshToken: refreshToken
                    });
                    const newToken = response.data.token || response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;
                    if (newToken) {
                        localStorage.setItem(STORAGE_KEYS.STAFF_TOKEN, newToken);
                        if (newRefreshToken) {
                            localStorage.setItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN, newRefreshToken);
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return staffClient(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                    window.location.href = ROUTES.STAFF_LOGIN;
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                window.location.href = ROUTES.STAFF_LOGIN;
            }
        }
        return Promise.reject(error);
    }
);

export default staffClient;

