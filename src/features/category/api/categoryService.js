import apiClient from '../../../services/apiClient';

/**
 * Category Service - Tất cả các API calls liên quan đến thể loại
 */

export const getAllCategories = () => {
    return apiClient.get('categories');
};

export const createCategory = (categoryData) => {
    return apiClient.post('categories', categoryData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const updateCategory = (id, categoryData) => {
    return apiClient.put(`categories/${id}`, categoryData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};

export const deleteCategory = (id) => {
    return apiClient.delete(`categories/${id}`);
};

export const getCategoryById = (id) => {
    return apiClient.get(`categories/${id}`);
};

