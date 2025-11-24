import apiClient from '../../../services/apiClient';

/**
 * Book Service - Tất cả các API calls liên quan đến sách
 */

export const getAllBooks = () => {
    return apiClient.get('books');
};

export const getBookById = (id) => {
    return apiClient.get(`books/${id}`);
};

export const searchBooks = (keyword) => {
    return apiClient.get('books/search', {
        params: { keyword }
    });
};

export const getSortedBooks = (sortBy, order = 'asc') => {
    return apiClient.get('books/sorted', {
        params: { sortBy, order }
    });
};

export const filterBooksByCategory = (categoryId) => {
    return apiClient.get('books/filter', {
        params: { categoryId }
    });
};

export const getBooksByCategory = (categoryId, limit = 10) => {
    return apiClient.get(`books/category/${categoryId}`, {
        params: { limit }
    });
};

export const createBook = (bookData, imageFile) => {
    const formData = new FormData();
    formData.append('book', JSON.stringify(bookData));
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    return apiClient.post('books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

export const updateBook = (id, bookData, imageFile) => {
    const formData = new FormData();
    formData.append('book', JSON.stringify(bookData));
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    return apiClient.put(`books/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

export const deleteBook = (id) => {
    return apiClient.delete(`books/${id}`);
};

