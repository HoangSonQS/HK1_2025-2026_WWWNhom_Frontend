import { API_BASE_URL } from './constants';

/**
 * Chuyển đổi imageUrl từ relative path sang full URL
 * @param {string} imageUrl - URL ảnh từ backend (có thể là relative hoặc absolute)
 * @returns {string} - Full URL của ảnh
 */
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return '/placeholder-book.jpg';
    }

    // Nếu đã là full URL (http/https), trả về nguyên
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Lấy base URL từ API_BASE_URL (bỏ /api/ ở cuối và trailing slash)
    let baseUrl = API_BASE_URL.replace('/api/', '').replace(/\/$/, '');
    
    // Nếu là relative path (bắt đầu bằng /uploads/), thêm base URL của backend
    if (imageUrl.startsWith('/uploads/')) {
        return `${baseUrl}${imageUrl}`;
    }

    // Nếu không có /uploads/, thêm vào
    if (!imageUrl.startsWith('/')) {
        return `${baseUrl}/uploads/${imageUrl}`;
    }

    // Trường hợp khác, trả về placeholder
    return '/placeholder-book.jpg';
};

