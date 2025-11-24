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

