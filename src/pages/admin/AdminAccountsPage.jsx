import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Switch, message, Tag, Modal, Form, Input, Select, Checkbox } from 'antd';
import { EditOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { getAllAccounts, updateAccountStatus, getMyAccount, updateAccount, updateAccountById, createStaffAccount, updateAccountRoles } from '../../features/user/api/userService';
import { decodeJWT, checkAdminRole } from '../../utils/jwt';

const { Option } = Select;

const AdminAccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [rolesModalVisible, setRolesModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [rolesForm] = Form.useForm();
    const [updatingStatus, setUpdatingStatus] = useState(new Set());

    // Danh sách roles có thể gán
    const AVAILABLE_ROLES = [
        { value: 'ADMIN', label: 'Admin', color: 'red' },
        { value: 'SELLER_STAFF', label: 'Nhân viên bán hàng', color: 'blue' },
        { value: 'WAREHOUSE_STAFF', label: 'Nhân viên kho', color: 'orange' },
        { value: 'CUSTOMER', label: 'Khách hàng', color: 'green' }
    ];

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const response = await getAllAccounts();
            const accountsData = Array.isArray(response.data) 
                ? response.data 
                : (response.data?.data || response.data || []);
            
            const sortedAccounts = [...accountsData].sort((a, b) => {
                const idA = a.id || 0;
                const idB = b.id || 0;
                return idA - idB;
            });
            
            setAccounts(sortedAccounts);
        } catch (error) {
            console.error('❌ Error loading accounts:', error);
            const errorMsg = error.response?.data?.message || 'Không thể tải danh sách tài khoản';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (accountId, isActive) => {
        if (updatingStatus.has(accountId)) return;
        
        setUpdatingStatus(prev => new Set(prev).add(accountId));
        
        try {
            const response = await updateAccountStatus(accountId, isActive);
            const updatedAccount = response.data;
            
            message.success(isActive ? 'Kích hoạt tài khoản thành công' : 'Vô hiệu hóa tài khoản thành công');
            
            setAccounts(prevAccounts => 
                prevAccounts.map(account => 
                    account.id === accountId 
                        ? { ...account, ...updatedAccount } 
                        : account
                )
            );
        } catch (error) {
            console.error('Error updating account status:', error);
            message.error('Cập nhật trạng thái tài khoản thất bại');
        } finally {
            setUpdatingStatus(prev => {
                const newSet = new Set(prev);
                newSet.delete(accountId);
                return newSet;
            });
        }
    };

    const handleEdit = async (accountId = null) => {
        try {
            let account;
            if (accountId) {
                account = accounts.find(acc => acc.id === accountId);
                if (!account) {
                    message.error('Không tìm thấy tài khoản');
                    return;
                }
            } else {
                const response = await getMyAccount();
                account = response.data;
            }
            
            setEditingAccount(account);
            form.setFieldsValue({
                email: account.email,
                firstName: account.firstName,
                lastName: account.lastName,
                phoneNumber: account.phoneNumber,
            });
            setEditModalVisible(true);
        } catch (error) {
            console.error('Error loading account:', error);
            message.error('Không thể tải thông tin tài khoản');
        }
    };

    const handleUpdateAccount = async (values) => {
        try {
            let updatedAccount = null;
            
            if (editingAccount && editingAccount.id) {
                const jwtData = decodeJWT();
                const isMyAccount = jwtData && jwtData.sub === editingAccount.username;
                
                if (isMyAccount) {
                    const response = await updateAccount(values);
                    updatedAccount = response.data;
                } else {
                    const response = await updateAccountById(editingAccount.id, values);
                    updatedAccount = response.data;
                }
            } else {
                const response = await updateAccount(values);
                updatedAccount = response.data;
            }
            
            message.success('Cập nhật tài khoản thành công');
            setEditModalVisible(false);
            form.resetFields();
            
            if (updatedAccount && editingAccount && editingAccount.id) {
                setAccounts(prevAccounts => 
                    prevAccounts.map(account => 
                        account.id === editingAccount.id 
                            ? { ...account, ...updatedAccount } 
                            : account
                    )
                );
            }
            
            setEditingAccount(null);
        } catch (error) {
            console.error('Error updating account:', error);
            const errorMsg = error.response?.data?.message || 'Cập nhật tài khoản thất bại';
            message.error(errorMsg);
        }
    };

    const handleCreateStaff = () => {
        setEditingAccount(null);
        createForm.resetFields();
        // Reset form với giá trị mặc định
        setTimeout(() => {
            createForm.setFieldsValue({
                username: '',
                password: '',
                email: '',
                roles: []
            });
        }, 0);
        setCreateModalVisible(true);
    };

    const handleCreateSubmit = async (values) => {
        try {
            const response = await createStaffAccount(values);
            message.success('Tạo tài khoản nhân viên thành công!');
            setCreateModalVisible(false);
            createForm.resetFields();
            loadAccounts();
        } catch (error) {
            console.error('Error creating staff account:', error);
            const errorMsg = error.response?.data?.message || 'Tạo tài khoản thất bại';
            message.error(errorMsg);
        }
    };

    const handleEditRoles = (account) => {
        setEditingAccount(account);
        const rolesArray = Array.isArray(account.roles) 
            ? account.roles 
            : Array.from(account.roles || []);
        rolesForm.setFieldsValue({
            roles: rolesArray
        });
        setRolesModalVisible(true);
    };

    const handleUpdateRoles = async (values) => {
        try {
            const response = await updateAccountRoles(editingAccount.id, values.roles);
            message.success('Cập nhật vai trò thành công!');
            setRolesModalVisible(false);
            rolesForm.resetFields();
            
            setAccounts(prevAccounts => 
                prevAccounts.map(account => 
                    account.id === editingAccount.id 
                        ? { ...account, roles: values.roles } 
                        : account
                )
            );
            setEditingAccount(null);
        } catch (error) {
            console.error('Error updating roles:', error);
            const errorMsg = error.response?.data?.message || 'Cập nhật vai trò thất bại';
            message.error(errorMsg);
        }
    };

    const getRoleColor = (role) => {
        const roleUpper = role?.toUpperCase();
        const roleConfig = AVAILABLE_ROLES.find(r => r.value === roleUpper);
        return roleConfig?.color || 'default';
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Họ tên',
            key: 'fullName',
            render: (_, record) => {
                const firstName = record.firstName || '';
                const lastName = record.lastName || '';
                return `${firstName} ${lastName}`.trim() || '-';
            },
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (phone) => phone || '-',
        },
        {
            title: 'Vai trò',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles, record) => {
                if (!roles) return '-';
                
                let roleArray = [];
                if (Array.isArray(roles)) {
                    roleArray = roles;
                } else if (roles instanceof Set || typeof roles === 'object') {
                    roleArray = Array.from(roles);
                } else {
                    roleArray = [roles];
                }
                
                if (roleArray.length === 0) return '-';
                
                return (
                    <Space direction="vertical" size={4}>
                        <Space wrap>
                        {roleArray.map((role, index) => (
                            <Tag 
                                key={index} 
                                color={getRoleColor(role)}
                            >
                                {role}
                            </Tag>
                        ))}
                        </Space>
                        {checkAdminRole(true) && (
                            <Button 
                                type="link" 
                                size="small" 
                                onClick={() => handleEditRoles(record)}
                                style={{ padding: 0, height: 'auto' }}
                            >
                                Sửa vai trò
                            </Button>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive, record) => {
                const isUpdating = updatingStatus.has(record.id);
                return (
                    <Switch
                        key={`switch-${record.id}`}
                        size="small"
                        checked={isActive}
                        disabled={isUpdating}
                        onChange={(checked) => {
                            if (!isUpdating) {
                                handleStatusChange(record.id, checked);
                            }
                        }}
                    />
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => {
                const jwtData = decodeJWT();
                const isMyAccount = jwtData && jwtData.sub === record.username;
                const userIsAdmin = checkAdminRole(true);
                
                if (userIsAdmin || isMyAccount) {
                    return (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record.id)}
                            size="small"
                        >
                            Cập nhật
                        </Button>
                    );
                }
                return <span>-</span>;
            },
        },
    ];

    return (
        <div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24 
            }}>
                <h1 style={{ margin: 0 }}>Quản lý Tài khoản</h1>
                {checkAdminRole(true) && (
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        size="large"
                        onClick={handleCreateStaff}
                    >
                        Tạo tài khoản nhân viên
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={accounts}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} tài khoản`,
                }}
            />

            {/* Modal Cập nhật thông tin */}
            <Modal
                title="Cập nhật Thông tin tài khoản"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    form.resetFields();
                    setEditingAccount(null);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateAccount}
                >
                    <Form.Item label="Tên đăng nhập">
                        <Input 
                            value={editingAccount?.username} 
                            disabled 
                            style={{ background: '#f5f5f5' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Email" size="large" />
                    </Form.Item>
                    <Form.Item name="firstName" label="Họ">
                        <Input placeholder="Họ" size="large" />
                    </Form.Item>
                    <Form.Item name="lastName" label="Tên">
                        <Input placeholder="Tên" size="large" />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Số điện thoại">
                        <Input placeholder="Số điện thoại" size="large" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" size="large">
                                Cập nhật
                            </Button>
                            <Button size="large" onClick={() => {
                                setEditModalVisible(false);
                                form.resetFields();
                                setEditingAccount(null);
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Tạo tài khoản nhân viên */}
            <Modal
                title="Tạo tài khoản nhân viên mới"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateSubmit}
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Tên đăng nhập" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="roles"
                        label="Vai trò"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ít nhất một vai trò!' }
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn vai trò"
                            size="large"
                        >
                            {AVAILABLE_ROLES.map(role => (
                                <Option key={role.value} value={role.value}>
                                    <Tag color={role.color}>{role.label}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" size="large">
                                Tạo tài khoản
                            </Button>
                            <Button size="large" onClick={() => {
                                setCreateModalVisible(false);
                                createForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Cập nhật vai trò */}
            <Modal
                title={`Cập nhật vai trò: ${editingAccount?.username}`}
                open={rolesModalVisible}
                onCancel={() => {
                    setRolesModalVisible(false);
                    rolesForm.resetFields();
                    setEditingAccount(null);
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={rolesForm}
                    layout="vertical"
                    onFinish={handleUpdateRoles}
                >
                    <Form.Item
                        name="roles"
                        label="Vai trò"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ít nhất một vai trò!' }
                        ]}
                    >
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {AVAILABLE_ROLES.map(role => (
                                    <Checkbox key={role.value} value={role.value}>
                                        <Tag color={role.color}>{role.label}</Tag>
                                    </Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" size="large">
                                Cập nhật
                            </Button>
                            <Button size="large" onClick={() => {
                                setRolesModalVisible(false);
                                rolesForm.resetFields();
                                setEditingAccount(null);
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminAccountsPage;
