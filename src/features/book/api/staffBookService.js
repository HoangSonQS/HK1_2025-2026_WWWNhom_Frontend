import staffApiClient from '../../../services/staffApiClient';

/**
 * Staff Book Service - Tất cả các API calls liên quan đến sách cho staff
 * Sử dụng staffApiClient với staffToken
 */

export const getAllBooks = () => {
    return staffApiClient.get('books');
};

export const getBookById = (id) => {
    return staffApiClient.get(`books/${id}`);
};

export const searchBooks = (keyword) => {
    return staffApiClient.get('books/search', {
        params: { keyword }
    });
};

export const getSortedBooks = (sortBy, order = 'asc') => {
    return staffApiClient.get('books/sorted', {
        params: { sortBy, order }
    });
};

export const filterBooksByCategory = (categoryId) => {
    return staffApiClient.get('books/filter', {
        params: { categoryId }
    });
};

export const getBooksByCategory = (categoryId, limit = 10) => {
    return staffApiClient.get(`books/category/${categoryId}`, {
        params: { limit }
    });
};

export const createBook = (bookData, imageFile) => {
    const formData = new FormData();
    formData.append('book', JSON.stringify(bookData));
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    return staffApiClient.post('books', formData, {
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
    
    return staffApiClient.put(`books/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
};

export const deleteBook = (id) => {
    return staffApiClient.delete(`books/${id}`);
};

