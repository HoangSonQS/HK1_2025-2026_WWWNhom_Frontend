import { useState, useEffect } from 'react';
import { getCart } from '../features/cart/api/cartService';
import { decodeJWT } from '../utils/jwt';

/**
 * Custom hook để quản lý số lượng items trong giỏ hàng
 * Tự động cập nhật khi user đăng nhập/đăng xuất
 */
export const useCartCount = () => {
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadCartCount = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setCartCount(0);
            return;
        }

        const decoded = decodeJWT(token);
        if (!decoded) {
            setCartCount(0);
            return;
        }

        setLoading(true);
        try {
            const response = await getCart();
            const items = response.data?.items || [];
            // Đếm số lượng sách khác nhau (unique items)
            setCartCount(items.length);
        } catch (error) {
            // Nếu lỗi 401 hoặc không có quyền, set về 0
            if (error.response?.status === 401 || error.response?.status === 403) {
                setCartCount(0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCartCount();
        
        // Listen to cart update events
        const handleCartUpdate = () => {
            loadCartCount();
        };
        
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        // Reload khi token thay đổi (đăng nhập/đăng xuất)
        const handleStorageChange = () => {
            loadCartCount();
        };
        
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return { cartCount, loading, refreshCartCount: loadCartCount };
};

