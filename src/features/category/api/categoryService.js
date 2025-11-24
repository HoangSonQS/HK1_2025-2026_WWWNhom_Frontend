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

