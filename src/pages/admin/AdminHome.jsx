import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BookOutlined, FolderOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Dashboard Quản trị</h1>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/books')}
                        style={{ textAlign: 'center' }}
                    >
                        <BookOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                        <h3>Quản lý Sách</h3>
                        <p>Thêm, sửa, xóa sách</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/categories')}
                        style={{ textAlign: 'center' }}
                    >
                        <FolderOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                        <h3>Quản lý Thể loại</h3>
                        <p>Thêm thể loại mới</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/accounts')}
                        style={{ textAlign: 'center' }}
                    >
                        <UserOutlined style={{ fontSize: 48, color: '#ff6b35', marginBottom: 16 }} />
                        <h3>Quản lý Tài khoản</h3>
                        <p>Xem và cập nhật tài khoản</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/orders')}
                        style={{ textAlign: 'center' }}
                    >
                        <ShoppingOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                        <h3>Quản lý Đơn hàng</h3>
                        <p>Xem và quản lý đơn hàng</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminHome;

