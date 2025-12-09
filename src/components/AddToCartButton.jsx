import React, { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { addToCart, getCart } from '../features/cart/api/cartService';
import { decodeJWT } from '../utils/jwt';
import { STORAGE_KEYS } from '../utils/constants';
import LoginRequiredModal from './LoginRequiredModal';

const AddToCartButton = ({ book, quantity = 1, size = 'middle', block = false }) => {
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [warningModal, setWarningModal] = useState({
        open: false,
        title: '',
        content: '',
    });

    const showWarning = (title, content) => {
        setWarningModal({ open: true, title, content });
    };

    const handleAddToCart = async (e) => {
        // Ngăn event propagation / prevent default để không trigger onClick/Link của Card
        e.stopPropagation();
        e.preventDefault();
        
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

        // Kiểm tra tồn kho với số lượng hiện có trong giỏ (tránh gọi API PUT khi đã vượt)
        try {
            const cartRes = await getCart();
            const existing = cartRes.data?.items?.find((it) => it.bookId === book.id);
            const currentQty = existing?.quantity || 0;
            const desiredQty = currentQty + quantity;

            if (book.quantity <= 0 || desiredQty > book.quantity) {
                const isMaxed = currentQty >= book.quantity;
                showWarning(
                    isMaxed ? 'Đã đạt số lượng tối đa' : 'Không đủ tồn kho',
                    isMaxed
                        ? `Bạn đã có ${currentQty} cuốn trong giỏ. Tồn kho tối đa cho phép là ${book.quantity} cuốn, không thể thêm nữa.`
                        : `Chỉ còn ${book.quantity} cuốn. Bạn đã có ${currentQty} trong giỏ, không thể thêm vượt tồn.`
                );
                return;
            }
        } catch (err) {
            // Nếu load giỏ lỗi, vẫn cho phép thử thêm (backend vẫn validation)
        }

        setLoading(true);
        try {
            await addToCart(book.id, quantity);
            // Trigger event để cập nhật cart count trong Header
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            message.success('Đã thêm vào giỏ hàng!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm vào giỏ hàng';
            if (errorMessage?.toLowerCase().includes('not enough stock')) {
                showWarning(
                    'Không đủ tồn kho',
                    error.response?.data?.message || 'Số lượng yêu cầu vượt tồn kho hiện có.'
                );
            } else {
                message.error(errorMessage);
            }
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
            <Modal
                open={warningModal.open}
                onOk={() => setWarningModal({ ...warningModal, open: false })}
                onCancel={() => setWarningModal({ ...warningModal, open: false })}
                centered
                okText="Đã hiểu"
                cancelButtonProps={{ style: { display: 'none' } }}
                title={warningModal.title}
            >
                {warningModal.content}
            </Modal>
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

