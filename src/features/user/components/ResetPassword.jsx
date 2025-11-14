import React, { useEffect } from 'react';
import { Button, Form, Input, message, Alert } from 'antd';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';
import { resetPassword } from '../api/authService';
import '../../../styles/auth.css';
import { ROUTES, STORAGE_KEYS } from '../../../utils/constants';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const username = searchParams.get('username') || localStorage.getItem(STORAGE_KEYS.RESET_USERNAME);
        
        if (!token || !username) {
            message.error('Link không hợp lệ hoặc đã hết hạn');
            navigate(ROUTES.FORGOT_PASSWORD);
        }
    }, [searchParams, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        setErrorMessage(''); // Xóa error message cũ
        
        try {
            const token = searchParams.get('token');
            const username = searchParams.get('username') || localStorage.getItem(STORAGE_KEYS.RESET_USERNAME);
            
            if (!token || !username) {
                const errorMsg = 'Thiếu thông tin token hoặc username';
                setErrorMessage(errorMsg);
                message.error(errorMsg);
                return;
            }

            const resetPasswordData = {
                username: username,
                token: token,
                newPassword: values.newPassword
            };

            console.log('🚀 Calling resetPassword API with data:', { username: resetPasswordData.username, token: '***', password: '***' });
            await resetPassword(resetPasswordData);
            console.log('✅ ResetPassword API success');
            message.success('Đặt lại mật khẩu thành công!');
            localStorage.removeItem(STORAGE_KEYS.RESET_USERNAME);
            navigate(ROUTES.LOGIN);
        } catch (error) {
            console.log(error);
            let errorMsg = '';
            if (error.response && error.response.data) {
                errorMsg = error.response.data.message || 'Đặt lại mật khẩu thất bại';
            } else {
                errorMsg = 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
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
                    <h1 className="login-title">RESET PASSWORD</h1>
                </div>
                
                <Form
                    form={form}
                    name="resetPassword"
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
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới!',
                            },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Mật khẩu mới"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng xác nhận mật khẩu!',
                            },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Mật khẩu xác nhận phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
                            },
                            {
                                validator: (_, value) => {
                                    if (!value || value === form.getFieldValue('newPassword')) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(
                                        new Error('Mật khẩu xác nhận không khớp!')
                                    )
                                }
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Xác nhận mật khẩu"
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
                            {loading ? 'Đang đặt lại mật khẩu...' : 'RESET PASSWORD'}
                        </Button>
                    </Form.Item>

                    <div className="register-link-container">
                        <Link to={ROUTES.LOGIN} className="register-link">
                            ← Back to Login
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
