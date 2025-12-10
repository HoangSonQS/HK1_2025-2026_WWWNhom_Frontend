import React from 'react';
import { Button, Form, Input, message, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { forgotPassword } from '../api/authService';
import '../../../styles/auth.css';
import { ROUTES, STORAGE_KEYS } from '../../../utils/constants';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    
    const onFinish = async (values) => {
        setLoading(true);
        setErrorMessage(''); // Xóa error message cũ
        
        try {
            const forgotPasswordData = {
                username: values.username,
                email: values.email
            };
            
            console.log('🚀 Calling forgotPassword API with data:', { username: forgotPasswordData.username, email: forgotPasswordData.email });
            await forgotPassword(forgotPasswordData);
            console.log('✅ ForgotPassword API success');
            message.success('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
            // Lưu username để dùng ở trang reset password
            localStorage.setItem(STORAGE_KEYS.RESET_USERNAME, values.username);
        } catch (error) {
            console.log(error);
            let errorMsg = '';
            if (error.response && error.response.data) {
                errorMsg = error.response.data.message || 'Gửi email thất bại';
            } else {
                errorMsg = 'Gửi email thất bại. Vui lòng thử lại.';
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
                    <h1 className="login-title">QUÊN MẬT KHẨU</h1>
                </div>
                
                <Form
                    name="forgotPassword"
                    className="login-form-modern"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
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
                        label="Tên đăng nhập"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên đăng nhập!',
                            },
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />}
                            placeholder="Tên đăng nhập"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                required: true,
                                type: 'email',
                                message: 'Vui lòng nhập email hợp lệ!',
                            },
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined className="input-icon" />}
                            placeholder="Email"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="login-button"
                            size="large"
                            block
                            loading={loading}
                        >
                            {loading ? 'Đang gửi email...' : 'GỬI EMAIL'}
                        </Button>
                    </Form.Item>

                    <div className="register-link-container">
                        <Link to={ROUTES.LOGIN} className="register-link">
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;
