import apiClient from '../../../services/apiClient';

/**
 * Auth Service - Tất cả các API calls liên quan đến authentication
 */

export const register = (registerData) => {
    return apiClient.post('auth/register', registerData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const login = (loginData) => {
    return apiClient.post('auth/token', loginData, {
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(error => {
        // Log chi tiết lỗi để debug
        console.error('Login API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });
        throw error;
    });
};

export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await apiClient.post('auth/logout', { refreshToken }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
    }
};

export const changePassword = (changePasswordData) => {
    return apiClient.post('auth/change-password', changePasswordData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const forgotPassword = (forgotPasswordData) => {
    return apiClient.post('auth/forgot-password', forgotPasswordData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const resetPassword = (resetPasswordData) => {
    return apiClient.post('auth/reset-password', resetPasswordData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

