import React, { useEffect, useState } from 'react';
import { Layout, Button, Form, Input, message, Alert, Tabs, Card, Space, Tag, Modal, Select, Switch } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { updateAccount, getMyAccount, getMyAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/userService';
import { getProvinces, getDistricts, getWards } from '../../../utils/vietnamAddress';
import Header from '../../../components/Header';
import '../../../styles/auth.css';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const UpdateAccount = () => {
    const [form] = Form.useForm();
    const [addressForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [accountInfo, setAccountInfo] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    useEffect(() => {
        loadAccountInfo();
        loadAddresses();
    }, []);

    const loadAccountInfo = async () => {
        try {
            const response = await getMyAccount();
            const data = response.data;
            setAccountInfo(data);
            form.setFieldsValue({
                username: data.username,
                email: data.email,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phoneNumber: data.phoneNumber || ''
            });
        } catch (error) {
            console.error('Error loading account info:', error);
            message.error('Không thể tải thông tin tài khoản');
        }
    };

    const loadAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const response = await getMyAddresses();
            const raw = response.data || [];
            // Chuẩn hóa cờ mặc định từ backend (có thể trả về default/isDefault/1/true)
            const normalized = raw.map((addr) => {
                const flag = isDefaultAddress(addr) || addr.default === true || addr.default === 1 || addr.default === '1' || addr.default === 'true';
                return { ...addr, isDefault: flag };
            });
            // Đưa địa chỉ mặc định lên đầu danh sách
            normalized.sort((a, b) => {
                const aDef = isDefaultAddress(a);
                const bDef = isDefaultAddress(b);
                return Number(bDef) - Number(aDef);
            });
            setAddresses(normalized);
        } catch (error) {
            console.error('Error loading addresses:', error);
            message.error('Không thể tải danh sách địa chỉ');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        setErrorMessage('');

        try {
            const updateData = {
                // Không gửi username vì không cho phép cập nhật
                email: values.email,
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
            };

            await updateAccount(updateData);
            message.success('Cập nhật tài khoản thành công!');
            loadAccountInfo();
        } catch (error) {
            console.error('❌ Update account error:', error);
            let errorMsg = '';

            if (error.response && error.response.data) {
                errorMsg = error.response.data.message ||
                    error.response.data.error ||
                    'Cập nhật tài khoản thất bại';
            } else if (error.request) {
                errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            } else {
                errorMsg = 'Cập nhật tài khoản thất bại. Vui lòng thử lại.';
            }

            setErrorMessage(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setAvailableDistricts([]);
        setAvailableWards([]);
        addressForm.resetFields();
        setIsAddressModalVisible(true);
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        const province = address.city || null;
        const district = address.district || null;
        
        setSelectedProvince(province);
        setSelectedDistrict(district);
        
        if (province) {
            const districts = getDistricts(province);
            setAvailableDistricts(districts);
        } else {
            setAvailableDistricts([]);
        }
        
        if (province && district) {
            const wards = getWards(province, district);
            setAvailableWards(wards);
        } else {
            setAvailableWards([]);
        }
        
        addressForm.setFieldsValue({
            addressType: address.addressType,
            street: address.street,
            ward: address.ward,
            district: address.district,
            city: address.city,
            phoneNumber: address.phoneNumber,
            recipientName: address.recipientName,
            isDefault: address.isDefault
        });
        setIsAddressModalVisible(true);
    };

    const handleDeleteAddress = async (addressId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
            onOk: async () => {
                try {
                    await deleteAddress(addressId);
                    message.success('Xóa địa chỉ thành công!');
                    loadAddresses();
                } catch (error) {
                    message.error('Xóa địa chỉ thất bại');
                }
            }
        });
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await setDefaultAddress(addressId);
            message.success('Đặt địa chỉ mặc định thành công!');
            loadAddresses();
        } catch (error) {
            message.error('Đặt địa chỉ mặc định thất bại');
        }
    };

    const onAddressFormFinish = async (values) => {
        try {
            const addressData = {
                addressType: values.addressType || 'OTHER',
                street: values.street,
                ward: values.ward,
                district: values.district,
                city: values.city,
                phoneNumber: values.phoneNumber,
                recipientName: values.recipientName,
                isDefault: values.isDefault || false
            };

            if (editingAddress) {
                await updateAddress(editingAddress.id, addressData);
                message.success('Cập nhật địa chỉ thành công!');
            } else {
                await addAddress(addressData);
                message.success('Thêm địa chỉ thành công!');
            }
            setIsAddressModalVisible(false);
            addressForm.resetFields();
            loadAddresses();
        } catch (error) {
            message.error(editingAddress ? 'Cập nhật địa chỉ thất bại' : 'Thêm địa chỉ thất bại');
        }
    };

    const addressTypeLabels = {
        'HOME': 'Nhà riêng',
        'OFFICE': 'Cơ quan',
        'OTHER': 'Khác'
    };

    const isDefaultAddress = (address) => {
        // Hỗ trợ boolean, number, string hoặc field "default" từ backend
        if (!address) return false;
        const flag = address.isDefault ?? address.default;
        return flag === true || flag === 1 || flag === '1' || flag === 'true' || flag === 'TRUE' || flag === 'True';
    };

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin cá nhân',
            children: (
                <Form
                    form={form}
                    name="updateAccount"
                    className="login-form-modern"
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
                        label="Tên đăng nhập"
                    >
                        <Input
                            prefix={<UserOutlined className="input-icon" />}
                            placeholder="Tên đăng nhập"
                            size="large"
                            className="login-input"
                            disabled
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

                    <Form.Item
                        name="firstName"
                        label="Họ"
                    >
                        <Input
                            placeholder="Họ"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label="Tên"
                    >
                        <Input
                            placeholder="Tên"
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                            {
                                pattern: /^[0-9]{10,11}$/,
                                message: 'Số điện thoại không hợp lệ!'
                            }
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined className="input-icon" />}
                            placeholder="Số điện thoại"
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
                            {loading ? 'Đang cập nhật...' : 'CẬP NHẬT THÔNG TIN'}
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            key: '2',
            label: 'Địa chỉ',
            children: (
                <div>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Danh sách địa chỉ</h3>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddAddress}
                        >
                            Thêm địa chỉ
                        </Button>
                    </div>

                    {loadingAddresses ? (
                        <div>Đang tải...</div>
                    ) : addresses.length === 0 ? (
                        <Card>
                            <p>Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới!</p>
                        </Card>
                    ) : (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {addresses.map((address) => {
                                const defaultFlag = isDefaultAddress(address);
                                return (
                                <Card
                                    key={address.id}
                                    style={{
                                        border: defaultFlag ? '1px solid #52c41a' : undefined,
                                        boxShadow: defaultFlag ? '0 2px 8px rgba(82,196,26,0.15)' : undefined
                                    }}
                                    headStyle={defaultFlag ? { background: '#f6ffed' } : undefined}
                                    title={
                                        <Space>
                                            <HomeOutlined />
                                            <span>{addressTypeLabels[address.addressType] || address.addressType}</span>
                                            {defaultFlag && (
                                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                                    Mặc định
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    extra={
                                        <Space>
                                            {!defaultFlag && (
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    onClick={() => handleSetDefaultAddress(address.id)}
                                                >
                                                    Đặt mặc định
                                                </Button>
                                            )}
                                            {defaultFlag && (
                                                <Tag color="green" style={{ marginRight: 8 }}>
                                                    Địa chỉ mặc định
                                                </Tag>
                                            )}
                                            <Button
                                                type="link"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditAddress(address)}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                type="link"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteAddress(address.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </Space>
                                    }
                                >
                                    <p><strong>Người nhận:</strong> {address.recipientName || 'N/A'}</p>
                                    <p><strong>Địa chỉ:</strong> {address.street}, {address.ward}, {address.district}, {address.city}</p>
                                    {address.phoneNumber && <p><strong>Số điện thoại:</strong> {address.phoneNumber}</p>}
                                </Card>
                            );})}
                        </Space>
                    )}
                </div>
            )
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header />
            <Content>
                <div className="login-page-container">
                    <div className="login-form-wrapper" style={{ maxWidth: '800px', width: '100%' }}>
                        <div className="login-form-header">
                            <h1 className="login-title">QUẢN LÝ TÀI KHOẢN</h1>
                        </div>

                        <Tabs items={tabItems} defaultActiveKey="1" />

                        <Modal
                            title={editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                            open={isAddressModalVisible}
                            onCancel={() => {
                                setIsAddressModalVisible(false);
                                addressForm.resetFields();
                                setEditingAddress(null);
                                setSelectedProvince(null);
                                setSelectedDistrict(null);
                                setAvailableDistricts([]);
                                setAvailableWards([]);
                            }}
                            footer={null}
                            width={600}
                        >
                            <Form
                                form={addressForm}
                                layout="vertical"
                                onFinish={onAddressFormFinish}
                            >
                                <Form.Item
                                    name="addressType"
                                    label="Loại địa chỉ"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại địa chỉ!' }]}
                                >
                                    <Select placeholder="Chọn loại địa chỉ">
                                        <Option value="HOME">Nhà riêng</Option>
                                        <Option value="OFFICE">Cơ quan</Option>
                                        <Option value="OTHER">Khác</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="recipientName"
                                    label="Tên người nhận"
                                >
                                    <Input placeholder="Tên người nhận" />
                                </Form.Item>

                                <Form.Item
                                    name="city"
                                    label="Tỉnh/Thành phố"
                                    rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                                >
                                    <Select
                                        placeholder="Chọn Tỉnh/Thành phố"
                                        value={selectedProvince}
                                        onChange={(value) => {
                                            setSelectedProvince(value);
                                            setSelectedDistrict(null);
                                            setAvailableWards([]);
                                            addressForm.setFieldsValue({
                                                district: undefined,
                                                ward: undefined
                                            });
                                            const districts = getDistricts(value);
                                            setAvailableDistricts(districts);
                                        }}
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={getProvinces().map(province => ({
                                            value: province,
                                            label: province
                                        }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="district"
                                    label="Quận/Huyện"
                                    rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                                >
                                    <Select
                                        placeholder="Chọn Quận/Huyện"
                                        value={selectedDistrict}
                                        disabled={!selectedProvince}
                                        onChange={(value) => {
                                            setSelectedDistrict(value);
                                            addressForm.setFieldsValue({
                                                ward: undefined
                                            });
                                            if (selectedProvince) {
                                                const wards = getWards(selectedProvince, value);
                                                setAvailableWards(wards);
                                            }
                                        }}
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={availableDistricts.map(district => ({
                                            value: district,
                                            label: district
                                        }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="ward"
                                    label="Phường/Xã"
                                    rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                                >
                                    <Select
                                        placeholder="Chọn Phường/Xã"
                                        disabled={!selectedDistrict}
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={availableWards.map(ward => ({
                                            value: ward,
                                            label: ward
                                        }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="street"
                                    label="Số nhà, tên đường"
                                >
                                    <Input placeholder="Số nhà, tên đường" />
                                </Form.Item>

                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại"
                                    rules={[
                                        {
                                            pattern: /^[0-9]{10,11}$/,
                                            message: 'Số điện thoại không hợp lệ!'
                                        }
                                    ]}
                                >
                                    <Input placeholder="Số điện thoại" />
                                </Form.Item>

                                {!editingAddress && (
                                    <Form.Item
                                        name="isDefault"
                                        valuePropName="checked"
                                    >
                                        <Switch /> Đặt làm địa chỉ mặc định
                                    </Form.Item>
                                )}

                                <Form.Item>
                                    <Space>
                                        <Button type="primary" htmlType="submit">
                                            {editingAddress ? 'Cập nhật' : 'Thêm'}
                                        </Button>
                                        <Button onClick={() => {
                                            setIsAddressModalVisible(false);
                                            addressForm.resetFields();
                                            setEditingAddress(null);
                                            setSelectedProvince(null);
                                            setSelectedDistrict(null);
                                            setAvailableDistricts([]);
                                            setAvailableWards([]);
                                        }}>
                                            Hủy
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default UpdateAccount;
