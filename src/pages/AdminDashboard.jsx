import React, { useEffect } from 'react';
import { Button, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { checkAdminRole } from '../utils/jwt';
import { ROUTES } from '../utils/constants';

const { Title, Paragraph, Text } = Typography;

const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!checkAdminRole()) {
            navigate(ROUTES.LOGIN, { replace: true });
        }
    }, [navigate]);

    const handleNavigateHome = () => {
        navigate(ROUTES.HOME);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f5f5',
                padding: 24
            }}
        >
            <Card
                title={<Title level={3} style={{ margin: 0 }}>SEBook Admin Dashboard</Title>}
                style={{ maxWidth: 520, width: '100%' }}
                bordered={false}
            >
                <Paragraph>
                    Đây là trang dashboard tạm thời dành cho quản trị viên. Bạn có thể sử dụng trang này để
                    kiểm thử luồng đăng nhập và phân quyền trước khi phát triển đầy đủ giao diện quản trị.
                </Paragraph>
                <Paragraph>
                    <Text strong>Trạng thái:</Text> Đã đăng nhập với quyền quản trị viên.
                </Paragraph>
                <Button type="primary" onClick={handleNavigateHome}>
                    Quay về trang chủ
                </Button>
            </Card>
        </div>
    );
};

export default AdminDashboard;


