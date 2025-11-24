import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Avatar, Dropdown, Input } from 'antd';
import { HomeOutlined, BookOutlined, UserOutlined, LogoutOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { decodeJWT, isAdminOrStaff } from '../utils/jwt';
import { logout } from '../features/user/api/authService';
import '../styles/header.css';

const { Search } = Input;

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [isAdminStaff, setIsAdminStaff] = React.useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            const decoded = decodeJWT(token);
            if (decoded) {
                setUser(decoded);
                setIsAdminStaff(isAdminOrStaff());
            }
        }
    }, []);

    const [searchValue, setSearchValue] = useState('');

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAdminStaff(false);
            navigate(ROUTES.HOME);
            window.location.reload();
        }
    };

    const handleSearch = (value) => {
        if (value.trim()) {
            navigate(`/books?search=${encodeURIComponent(value.trim())}`);
            setSearchValue('');
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản',
            onClick: () => navigate(ROUTES.UPDATE_ACCOUNT)
        },
        {
            key: 'change-password',
            icon: <SettingOutlined />,
            label: 'Đổi mật khẩu',
            onClick: () => navigate(ROUTES.CHANGE_PASSWORD)
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout
        }
    ];

    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link to={ROUTES.HOME}>Trang chủ</Link>
        },
        {
            key: 'books',
            icon: <BookOutlined />,
            label: <Link to="/books">Sách</Link>
        }
    ];

    return (
        <AntHeader className="app-header">
            <div className="header-content">
                <div className="header-logo">
                    <Link to={ROUTES.HOME}>
                        <span className="logo-text">SEBook</span>
                    </Link>
                </div>

                <Menu
                    mode="horizontal"
                    items={menuItems}
                    className="header-menu"
                    selectedKeys={[]}
                />

                <div className="header-search">
                    <Search
                        placeholder="Tìm kiếm sách..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="middle"
                        onSearch={handleSearch}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <div className="header-actions">
                    {user ? (
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            arrow
                        >
                            <Space className="user-info">
                                <Avatar icon={<UserOutlined />} />
                                <span>{user.sub || user.username || 'User'}</span>
                            </Space>
                        </Dropdown>
                    ) : (
                        <Space>
                            <Button type="default" onClick={() => navigate(ROUTES.LOGIN)}>
                                Đăng nhập
                            </Button>
                            <Button type="primary" className="login-button" onClick={() => navigate(ROUTES.REGISTER)}>
                                Đăng ký
                            </Button>
                        </Space>
                    )}
                </div>
            </div>
        </AntHeader>
    );
};

export default Header;

