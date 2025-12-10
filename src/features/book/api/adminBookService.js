import adminApiClient from '../../../services/adminApiClient';

/**
 * Admin Book Service - sử dụng adminApiClient với admin token
 */

export const getAllBooks = (includeInactive = false) =>
  adminApiClient.get('books', { params: { includeInactive } });

export const getBookById = (id) => adminApiClient.get(`books/${id}`);

export const searchBooks = (keyword) =>
  adminApiClient.get('books/search', { params: { keyword } });

export const getSortedBooks = (sortBy, order = 'asc') =>
  adminApiClient.get('books/sorted', { params: { sortBy, order } });

export const filterBooksByCategory = (categoryId) =>
  adminApiClient.get('books/filter', { params: { categoryId } });

export const getBooksByCategory = (categoryId, limit = 10) =>
  adminApiClient.get(`books/category/${categoryId}`, { params: { limit } });

export const createBook = (bookData, imageFile) => {
  const formData = new FormData();
  formData.append('book', JSON.stringify(bookData));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return adminApiClient.post('books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateBook = (id, bookData, imageFile) => {
  const formData = new FormData();
  formData.append('book', JSON.stringify(bookData));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return adminApiClient.put(`books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteBook = (id) => adminApiClient.delete(`books/${id}`);









