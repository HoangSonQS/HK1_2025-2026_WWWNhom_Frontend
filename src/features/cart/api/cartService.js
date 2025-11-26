import apiClient from '../../../services/apiClient';

/**
 * Lấy giỏ hàng của user hiện tại
 */
export const getCart = () => {
    return apiClient.get('cart');
};

/**
 * Thêm sách vào giỏ hàng
 * @param {number} bookId - ID của sách
 * @param {number} quantity - Số lượng (mặc định 1)
 */
export const addToCart = (bookId, quantity = 1) => {
    return apiClient.post('cart/add', {
        bookId,
        quantity
    });
};

/**
 * Cập nhật số lượng item trong giỏ hàng
 * @param {number} cartItemId - ID của cart item
 * @param {number} quantity - Số lượng mới
 */
export const updateCartItem = (cartItemId, quantity) => {
    return apiClient.put(`cart/items/${cartItemId}`, {
        quantity
    });
};

/**
 * Xóa item khỏi giỏ hàng
 * @param {number} cartItemId - ID của cart item
 */
export const removeCartItem = (cartItemId) => {
    return apiClient.delete(`cart/items/${cartItemId}`);
};

