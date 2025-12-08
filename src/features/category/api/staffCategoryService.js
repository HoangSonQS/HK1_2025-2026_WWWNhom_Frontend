import staffApiClient from '../../../services/staffApiClient';

/**
 * Staff Category Service - Tất cả các API calls liên quan đến thể loại cho staff
 * Sử dụng staffApiClient với staffToken
 */

export const getAllCategories = () => {
    return staffApiClient.get('categories');
};

export const createCategory = (categoryData) => {
    return staffApiClient.post('categories', categoryData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const updateCategory = (id, categoryData) => {
    return staffApiClient.put(`categories/${id}`, categoryData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const deleteCategory = (id) => {
    return staffApiClient.delete(`categories/${id}`);
};

export const getCategoryById = (id) => {
    return staffApiClient.get(`categories/${id}`);
};

