import apiClient from '../../../services/apiClient';

/**
 * User Service - Tất cả các API calls liên quan đến người dùng
 */

export const updateAccount = (accountData) => {
    return apiClient.put('admin/accounts/me', accountData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

/**
 * Lấy thông tin tài khoản hiện tại
 */
export const getMyAccount = () => {
    return apiClient.get('admin/accounts/me');
};

/**
 * Address APIs - Quản lý địa chỉ
 */
export const getMyAddresses = () => {
    return apiClient.get('user/addresses');
};

export const addAddress = (addressData) => {
    return apiClient.post('user/addresses', addressData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const updateAddress = (addressId, addressData) => {
    return apiClient.put(`user/addresses/${addressId}`, addressData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const deleteAddress = (addressId) => {
    return apiClient.delete(`user/addresses/${addressId}`);
};

export const setDefaultAddress = (addressId) => {
    return apiClient.put(`user/addresses/${addressId}/set-default`);
};

/**
 * Admin Account APIs - Quản lý tài khoản (chỉ dành cho admin)
 */
export const getAllAccounts = () => {
    return apiClient.get('admin/accounts');
};

export const updateAccountStatus = (accountId, isActive) => {
    return apiClient.put(`admin/accounts/${accountId}/status`, { isActive }, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

/**
 * Cập nhật thông tin tài khoản khác (chỉ dành cho admin)
 */
export const updateAccountById = (accountId, accountData) => {
    return apiClient.put(`admin/accounts/${accountId}`, accountData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

/**
 * Tạo tài khoản nhân viên mới (chỉ dành cho admin)
 */
export const createStaffAccount = (accountData) => {
    return apiClient.post('admin/accounts', accountData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

/**
 * Cập nhật roles của tài khoản (chỉ dành cho admin)
 */
export const updateAccountRoles = (accountId, roles) => {
    return apiClient.put(`admin/accounts/${accountId}/roles`, { roles }, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

