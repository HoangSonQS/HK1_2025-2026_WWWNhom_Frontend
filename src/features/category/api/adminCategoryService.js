import adminApiClient from '../../../services/adminApiClient';

export const getAllCategories = () => adminApiClient.get('categories');

export const createCategory = (categoryData) =>
  adminApiClient.post('categories', categoryData, {
    headers: { 'Content-Type': 'application/json' },
  });

export const updateCategory = (id, categoryData) =>
  adminApiClient.put(`categories/${id}`, categoryData, {
    headers: { 'Content-Type': 'application/json' },
  });

export const deleteCategory = (id) => adminApiClient.delete(`categories/${id}`);

export const getCategoryById = (id) => adminApiClient.get(`categories/${id}`);













