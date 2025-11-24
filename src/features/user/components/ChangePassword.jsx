import React from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/authService';
import { Form, Input, Button, message, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import '../../../styles/auth.css';
import { ROUTES } from '../../../utils/constants';

function ChangePassword() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleSubmit = async (values) => {
        setLoading(true);
        setErrorMessage(''); // Xóa error message cũ
        
        try {
            const changePasswordData = {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            };

            console.log('🚀 Calling changePassword API');
            await changePassword(changePasswordData);
            console.log('✅ ChangePassword API success');
            message.success('Đổi mật khẩu thành công!');
            navigate(ROUTES.HOME);
        } catch (error) {
            console.error('Error change password:', error);
            let errorMsg = '';
            if (error.response && error.response.data) {
                errorMsg = error.response.data.message || 'Đổi mật khẩu thất bại.';
            } else {
                errorMsg = 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
            }
            setErrorMessage(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(ROUTES.HOME);
    };

    return (
        <div className="login-page-container">
            <div className="login-form-wrapper">
                <div className="login-form-header">
                    <h1 className="login-title">CHANGE PASSWORD</h1>
                </div>
                
                <Form
                    form={form}
                    name="changePassword"
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
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Mật khẩu hiện tại"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
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
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
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
                                        new Error('Mật khẩu xác nhận không khớp với mật khẩu mới!')
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
                            {loading ? 'Đang đổi mật khẩu...' : 'CHANGE PASSWORD'}
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="default" 
                            onClick={handleCancel}
                            className="reset-button"
                            size="large"
                            block
                        >
                            CANCEL
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default ChangePassword;
