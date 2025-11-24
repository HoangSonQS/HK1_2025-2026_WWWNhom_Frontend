import React from 'react';
import { Button, Checkbox, Form, Input, message, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../../../styles/auth.css';
import { login } from '../api/authService';
import { ROUTES, STORAGE_KEYS } from '../../../utils/constants';
import { decodeJWT, checkSellerStaffRole, checkWarehouseStaffRole, checkCustomerRole } from '../../../utils/jwt';

const Login = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    
    const onFinish = async (values) => {
        setLoading(true);
        setErrorMessage(''); // Xóa error message cũ
        
        try {
            const loginData = {
                username: values.username || values.email, // Hỗ trợ cả username và email
                password: values.password
            };
            
            console.log('🚀 Calling login API with data:', { username: loginData.username, password: '***' });
            const response = await login(loginData);
            console.log('✅ Login API response:', response.data);
            
            // Backend trả về token, không phải accessToken
            if (response.data && (response.data.token || response.data.accessToken)) {
                const accessToken = response.data.token || response.data.accessToken;
                localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, accessToken);
                if (response.data.refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
                }
                
                // Giải mã JWT để xác định role hiện tại
                const jwtData = decodeJWT(accessToken);
                                
                message.success('Đăng nhập thành công!');
                
                // Điều hướng dựa trên role
                if (checkSellerStaffRole() || checkWarehouseStaffRole()) {
                    // Staff điều hướng đến dashboard (sẽ tạo sau)
                    navigate('/staff/dashboard'); // Hoặc route staff tương ứng
                } else if (checkCustomerRole()) {
                    // Customer điều hướng đến trang chủ
                    navigate(ROUTES.HOME);
                } else if (jwtData && jwtData.scope?.includes('ADMIN')) {
                    // Admin đăng nhập qua luồng user -> điều hướng về trang chủ để xem chức năng chung
                    navigate(ROUTES.HOME);
                } else {
                    // Mặc định điều hướng đến trang chủ
                    navigate(ROUTES.HOME);
                }
            } else {
                const errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng!';
                setErrorMessage(errorMsg);
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            let errorMsg = '';
            
            if (error.response && error.response.data) {
                // Backend trả về ErrorResponse với field 'message'
                errorMsg = error.response.data.message || 
                          error.response.data.error || 
                          'Tên đăng nhập hoặc mật khẩu không đúng';
                console.error('Error message from backend:', errorMsg);
            } else if (error.request) {
                // Request đã được gửi nhưng không nhận được response
                console.error('No response received:', error.request);
                errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                // Lỗi khi setup request
                console.error('Error setting up request:', error.message);
                errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';
            }
            
            // Hiển thị error message trên form
            setErrorMessage(errorMsg);
            // Vẫn hiển thị message notification
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <div className="login-form-header">
                    <h1 className="login-title">LOGIN</h1>
                </div>
                
                <Form
                    form={form}
                    name="login"
                    className="login-form-modern"
                    initialValues={{
                        remember: false,
                    }}
                    onFinish={onFinish}
                    autoComplete="off"
                    layout="vertical"
                >
                    {/* Hiển thị error message trên form */}
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
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
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
                            {loading ? 'Đang đăng nhập...' : 'LOGIN'}
                        </Button>
                    </Form.Item>

                    <div className="register-link-container">
                        <span>Don't have an account? </span>
                        <Link to={ROUTES.REGISTER} className="register-link">
                            Register
                        </Link>
                    </div>
                    
                    <div className="register-link-container" style={{ marginTop: '12px' }}>
                        <span>Bạn là quản trị viên? </span>
                        <Link to={ROUTES.ADMIN_LOGIN} className="register-link">
                            Đăng nhập Admin
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Login;
