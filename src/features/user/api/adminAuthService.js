import adminApiClient from '../../../services/adminApiClient';
import { STORAGE_KEYS } from '../../../utils/constants';

/**
 * Admin Auth Service - Sử dụng adminApiClient với adminToken
 * Chỉ dùng cho các trang admin
 */

export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
        if (refreshToken) {
            await adminApiClient.post('auth/logout', { refreshToken }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }
    } catch (error) {
        console.error('Admin logout error:', error);
    } finally {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
    }
};

