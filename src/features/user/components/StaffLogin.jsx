import React from 'react';
import { Button, Form, Input, message, Alert } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../../../styles/auth.css';
import { login } from '../api/authService';
import { ROUTES, STORAGE_KEYS } from '../../../utils/constants';
import { decodeJWT } from '../../../utils/jwt';

const StaffLogin = () => {
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
            
            console.log('🚀 Staff login API call:', { username: loginData.username, password: '***' });
            const response = await login(loginData);
            console.log('✅ Staff login API response:', response.data);
            
            if (response.data && (response.data.token || response.data.accessToken)) {
                const accessToken = response.data.token || response.data.accessToken;
                // Lưu token riêng cho staff, không ghi đè token public (customer)
                localStorage.setItem(STORAGE_KEYS.STAFF_TOKEN, accessToken);
                if (response.data.refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN, response.data.refreshToken);
                }
                
                // Kiểm tra role sau khi login - decode trực tiếp từ token vừa nhận được
                const jwtData = decodeJWT(accessToken);
                console.log('🔍 Decoded JWT Data:', jwtData);
                console.log('🔍 JWT Scope:', jwtData?.scope, 'Type:', typeof jwtData?.scope);
                
                // Kiểm tra scope trực tiếp từ decoded token
                if (!jwtData || !jwtData.scope) {
                    const errorMsg = 'Token không hợp lệ hoặc thiếu thông tin quyền.';
                    setErrorMessage(errorMsg);
                    message.error(errorMsg);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                    setLoading(false);
                    return;
                }
                
                // Kiểm tra scope có chứa SELLER_STAFF hoặc WAREHOUSE_STAFF
                let scopeString = '';
                if (typeof jwtData.scope === 'string') {
                    scopeString = jwtData.scope;
                } else if (Array.isArray(jwtData.scope)) {
                    scopeString = jwtData.scope.join(' ');
                }
                
                const upperScope = scopeString.toUpperCase();
                const isSellerStaff = upperScope.includes('SELLER_STAFF');
                const isWarehouseStaff = upperScope.includes('WAREHOUSE_STAFF');
                
                console.log('🔍 Is Seller Staff:', isSellerStaff, 'Is Warehouse Staff:', isWarehouseStaff, 'Scope:', scopeString);
                
                if (!isSellerStaff && !isWarehouseStaff) {
                    const errorMsg = 'Truy cập bị từ chối. Trang này chỉ dành cho nhân viên (Seller hoặc Warehouse).';
                    console.error('❌ Staff check failed. JWT data:', jwtData);
                    setErrorMessage(errorMsg);
                    message.error(errorMsg);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
                    setLoading(false);
                    return;
                }
                
                message.success('Đăng nhập thành công!');
                // Dispatch event để StaffHeader cập nhật
                window.dispatchEvent(new CustomEvent('staffTokenChanged'));
                navigate(ROUTES.STAFF_DASHBOARD);
            } else {
                const errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng!';
                setErrorMessage(errorMsg);
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('❌ Staff login error:', error);
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
                    <h1 className="login-title">ĐĂNG NHẬP NHÂN VIÊN</h1>
                    <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                        Đăng nhập dành cho nhân viên (Seller / Warehouse)
                    </p>
                </div>
                
                <Form
                    form={form}
                    name="staff-login"
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
                            Quên mật khẩu?
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
                            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP NHÂN VIÊN'}
                        </Button>
                    </Form.Item>

                    <div className="register-link-container">
                        <span>Bạn là khách hàng? </span>
                        <Link to={ROUTES.LOGIN} className="register-link">
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default StaffLogin;

