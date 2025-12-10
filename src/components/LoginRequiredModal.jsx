import React from 'react';
import { Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const LoginRequiredModal = ({ visible, onCancel, title = 'Yêu cầu đăng nhập', content = 'Bạn cần đăng nhập để sử dụng chức năng này.' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
        onCancel(); // Đóng modal trước
        // Lưu returnUrl để quay lại trang hiện tại sau khi đăng nhập
        const returnUrl = location.pathname + location.search;
        navigate(ROUTES.LOGIN, { state: { returnUrl } });
    };

    const handleCancel = () => {
        // Chỉ đóng modal, giữ nguyên trang hiện tại
        onCancel();
    };

    return (
        <Modal
            title={title}
            open={visible}
            onOk={handleLogin}
            onCancel={handleCancel}
            okText="Đăng nhập"
            cancelText="Hủy"
            okButtonProps={{ type: 'primary' }}
            maskClosable={false}
            keyboard={false}
        >
            <p>{content}</p>
        </Modal>
    );
};

export default LoginRequiredModal;

