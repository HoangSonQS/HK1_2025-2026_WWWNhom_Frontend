import React from 'react';
import { Button, Form, Input, message, Alert } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { register } from '../api/authService';
import '../../../styles/auth.css';
import { ROUTES } from '../../../utils/constants';

const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleSubmit = async (values) => {
        setLoading(true);
        setErrorMessage(''); // Xóa error message cũ
        
        try {
            const registerData = {
                username: values.username,
                email: values.email,
                password: values.password,
            };

            console.log('🚀 Calling register API with data:', { username: registerData.username, email: registerData.email, password: '***' });
            await register(registerData);
            console.log('✅ Register API success');
            message.success('Đăng ký tài khoản thành công!');
            navigate(ROUTES.LOGIN);
        } catch (error) {
            let errorMsg = '';
            if (error.response) {
                console.error('Server responded with status code:', error.response.status);
                console.error('Error data:', error.response.data);
                errorMsg = error.response.data?.message || 'Đăng ký thất bại';
            } else {
                console.error('Error:', error.message);
                errorMsg = 'Đăng ký thất bại. Vui lòng thử lại.';
            }
            setErrorMessage(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        form.resetFields();
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <div className="login-form-header">
                    <h1 className="login-title">REGISTER</h1>
                </div>
                
                <Form
                    form={form}
                    name="register"
                    className="login-form-modern"
                    layout="vertical"
                    onFinish={handleSubmit}
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
                            { required: true, message: "Vui lòng nhập tên đăng nhập" },
                            {
                                pattern: /^[a-zA-Z0-9]+$/,
                                message: "Tên đăng nhập chỉ được chứa chữ cái và số!"
                            }
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
                            { required: true, type: 'email', message: "Vui lòng nhập email hợp lệ" },
                            {
                                validator: (_, value) => {
                                    if (!value || !/\s/.test(value)) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error("Email không được chứa khoảng trắng"))
                                }
                            }
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined className="input-icon" />}
                            placeholder="Email"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
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

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            {
                                validator: (_, value) => {
                                    if (!value || value === form.getFieldValue('password')) {
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
                            {loading ? 'Đang đăng ký...' : 'REGISTER'}
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="default" 
                            onClick={handleReset}
                            className="reset-button"
                            size="large"
                            block
                        >
                            RESET
                        </Button>
                    </Form.Item>

                    <div className="register-link-container">
                        <span>Already have an account? </span>
                        <Link to={ROUTES.LOGIN} className="register-link">
                            Login
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;
