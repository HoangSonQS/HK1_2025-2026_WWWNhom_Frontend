import React, { useState } from 'react';
import { Button, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { addToCart } from '../features/cart/api/cartService';
import { decodeJWT } from '../utils/jwt';
import { STORAGE_KEYS } from '../utils/constants';
import LoginRequiredModal from './LoginRequiredModal';

const AddToCartButton = ({ book, quantity = 1, size = 'middle', block = false }) => {
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const handleAddToCart = async (e) => {
        // Ngăn event propagation để không trigger onClick của Card
        e.stopPropagation();
        
        // Kiểm tra đăng nhập - CHỈ đọc jwtToken, không đọc adminToken
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        const decoded = decodeJWT(token, false); // useAdminToken = false
        if (!decoded) {
            setShowLoginModal(true);
            return;
        }

        // Kiểm tra số lượng tồn kho
        if (book.quantity < quantity) {
            message.error(`Số lượng tồn kho không đủ. Chỉ còn ${book.quantity} cuốn`);
            return;
        }

        setLoading(true);
        try {
            await addToCart(book.id, quantity);
            // Trigger event để cập nhật cart count trong Header
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            message.success('Đã thêm vào giỏ hàng!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm vào giỏ hàng';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                loading={loading}
                size={size}
                block={block}
                disabled={book.quantity === 0}
            >
                {book.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
            <LoginRequiredModal
                visible={showLoginModal}
                onCancel={() => setShowLoginModal(false)}
                title="Yêu cầu đăng nhập"
                content="Bạn cần đăng nhập để thêm sách vào giỏ hàng."
            />
        </>
    );
};

export default AddToCartButton;

