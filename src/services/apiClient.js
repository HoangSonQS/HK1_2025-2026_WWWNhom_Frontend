import axios from 'axios';
import { getApiBaseUrl } from '../utils/env';

// Lấy biến từ .env - trong Vite phải dùng import.meta.env
const URLString = getApiBaseUrl();
const client = axios.create({
    baseURL: URLString,
});

// Token config - tự động thêm token vào header
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            
            // Decode token để xem scope
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                        .join('')
                );
                const decoded = JSON.parse(jsonPayload);
                console.log('🔐 JWT Decoded in Request:', decoded);
                console.log('🔐 JWT Scope:', decoded.scope);
            } catch (e) {
                console.error('❌ Error decoding token:', e);
            }
        } else {
            console.warn('⚠️ No JWT token found!');
        }
        // Log request để debug
        console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullURL: config.baseURL + config.url,
            baseURL: config.baseURL,
            data: config.data,
            hasToken: !!token,
            authHeader: config.headers.Authorization ? 'Bearer ***' : 'None'
        });
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Xử lý response - tự động refresh token nếu cần
client.interceptors.response.use(
    (response) => {
        // Log response để debug
        console.log('📥 API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    async (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            fullURL: error.config?.baseURL + error.config?.url,
            data: error.response?.data,
            message: error.message
        });
        
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${getApiBaseUrl()}auth/refresh`, {
                        refreshToken: refreshToken
                    });
                    // Backend trả về token, không phải accessToken
                    const newToken = response.data.token || response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;
                    if (newToken) {
                        localStorage.setItem('jwtToken', newToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refreshToken', newRefreshToken);
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return client(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/auth/login';
                    return Promise.reject(refreshError);
                }
            } else {
                localStorage.removeItem('jwtToken');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default client;

