import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Typography, message } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    BookOutlined,
    FolderOutlined,
    UserOutlined,
    DashboardOutlined,
    LogoutOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { checkAdminRole } from '../utils/jwt';
import { ROUTES } from '../utils/constants';
import { logout } from '../features/user/api/authService';
import Header from '../components/Header';
import '../styles/admin.css';

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!checkAdminRole()) {
            message.error('Bạn không có quyền truy cập trang này');
            navigate(ROUTES.ADMIN_LOGIN, { replace: true });
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('refreshToken');
            navigate(ROUTES.ADMIN_LOGIN);
            message.success('Đăng xuất thành công');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/admin/dashboard')
        },
        {
            key: '/admin/books',
            icon: <BookOutlined />,
            label: 'Quản lý Sách',
            onClick: () => navigate('/admin/books')
        },
        {
            key: '/admin/categories',
            icon: <FolderOutlined />,
            label: 'Quản lý Thể loại',
            onClick: () => navigate('/admin/categories')
        },
        {
            key: '/admin/accounts',
            icon: <UserOutlined />,
            label: 'Quản lý Tài khoản',
            onClick: () => navigate('/admin/accounts')
        },
        {
            key: '/admin/orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý Đơn hàng',
            onClick: () => navigate('/admin/orders')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout
        }
    ];

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/') return '/admin/dashboard';
        if (path.startsWith('/admin/books')) return '/admin/books';
        if (path.startsWith('/admin/categories')) return '/admin/categories';
        if (path.startsWith('/admin/accounts')) return '/admin/accounts';
        if (path.startsWith('/admin/orders')) return '/admin/orders';
        return '/admin/dashboard';
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header />
            <Layout>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    width={250}
                    style={{
                        background: '#fff',
                        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <Title level={4} style={{ margin: 0, color: '#ff6b35' }}>
                            {collapsed ? 'AD' : 'ADMIN'}
                        </Title>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedKey()]}
                        items={menuItems}
                        style={{ borderRight: 0, marginTop: 8 }}
                    />
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content
                        style={{
                            background: '#fff',
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            borderRadius: 8
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
