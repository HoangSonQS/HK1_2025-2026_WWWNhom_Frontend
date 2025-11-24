import React from 'react';
import { Button, Form, Input, message, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../../../styles/auth.css';
import { login } from '../api/authService';
import { ROUTES, STORAGE_KEYS } from '../../../utils/constants';
import { decodeJWT, checkAdminRole } from '../../../utils/jwt';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    
    const onFinish = async (values) => {
        setLoading(true);
        setErrorMessage('');
        
        try {
            const loginData = {
                username: values.username || values.email,
                password: values.password
            };
            
            console.log('🚀 Admin login API call:', { username: loginData.username, password: '***' });
            const response = await login(loginData);
            console.log('✅ Admin login API response:', response.data);
            
            if (response.data && (response.data.token || response.data.accessToken)) {
                const accessToken = response.data.token || response.data.accessToken;
                localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, accessToken);
                if (response.data.refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
                }
                
                // Kiểm tra role sau khi login
                const jwtData = decodeJWT(accessToken);
                console.log('🔍 Decoded JWT Data:', jwtData);
                console.log('🔍 JWT Scope:', jwtData?.scope, 'Type:', typeof jwtData?.scope);
                
                const isAdmin = checkAdminRole();
                console.log('🔍 Is Admin:', isAdmin);
                
                if (!isAdmin) {
                    const errorMsg = 'Truy cập bị từ chối. Trang này chỉ dành cho quản trị viên.';
                    console.error('❌ Admin check failed. JWT data:', jwtData);
                    setErrorMessage(errorMsg);
                    message.error(errorMsg);
                    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                    setLoading(false);
                    return;
                }
                
                message.success('Đăng nhập thành công!');
                navigate(ROUTES.ADMIN_DASHBOARD);
            } else {
                const errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng!';
                setErrorMessage(errorMsg);
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('❌ Admin login error:', error);
            let errorMsg = '';
            
            if (error.response && error.response.data) {
                errorMsg = error.response.data.message || 
                          error.response.data.error || 
                          'Tên đăng nhập hoặc mật khẩu không đúng';
            } else if (error.request) {
                errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';
            }
            
            setErrorMessage(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <div className="login-form-header">
                    <h1 className="login-title">ADMIN LOGIN</h1>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                        Đăng nhập dành cho quản trị viên
                    </p>
                </div>
                
                <Form
                    form={form}
                    name="admin-login"
                    className="login-form-modern"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    {errorMessage && (
                        <Form.Item>
                            <Alert
                                message={errorMessage}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setErrorMessage('')}
                                style={{ marginBottom: 16 }}
                            />
                        </Form.Item>
                    )}
                    
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên đăng nhập hoặc email!',
                            },
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />}
                            placeholder="Tên đăng nhập hoặc Email"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu!',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Mật khẩu"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <div className="login-form-options">
                        <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-password-link">
                            Forgot your password?
                        </Link>
                    </div>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="login-button"
                            size="large"
                            block
                            loading={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'ADMIN LOGIN'}
                        </Button>
                    </Form.Item>

                    <div className="register-link-container">
                        <span>Bạn là khách hàng hoặc nhân viên? </span>
                        <Link to={ROUTES.LOGIN} className="register-link">
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default AdminLogin;

