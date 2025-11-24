import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Switch, message, Tag, Modal, Form, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getAllAccounts, updateAccountStatus, getMyAccount, updateAccount, updateAccountById } from '../../features/user/api/userService';
import { decodeJWT, checkAdminRole } from '../../utils/jwt';

const AdminAccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [form] = Form.useForm();
    const [updatingStatus, setUpdatingStatus] = useState(new Set());

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const response = await getAllAccounts();
            console.log('🔍 getAllAccounts response:', response);
            console.log('🔍 Response data:', response.data);
            
            // Xử lý response có thể là array trực tiếp hoặc trong data
            const accountsData = Array.isArray(response.data) 
                ? response.data 
                : (response.data?.data || response.data || []);
            
            // Sắp xếp theo ID tăng dần
            const sortedAccounts = [...accountsData].sort((a, b) => {
                const idA = a.id || 0;
                const idB = b.id || 0;
                return idA - idB;
            });
            
            console.log('🔍 Processed accounts:', sortedAccounts);
            setAccounts(sortedAccounts);
        } catch (error) {
            console.error('❌ Error loading accounts:', error);
            console.error('❌ Error response:', error.response);
            const errorMsg = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Không thể tải danh sách tài khoản';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (accountId, isActive) => {
        // Ngăn không cho trigger nhiều lần cùng lúc
        if (updatingStatus.has(accountId)) {
            return;
        }
        
        setUpdatingStatus(prev => new Set(prev).add(accountId));
        
        try {
            const response = await updateAccountStatus(accountId, isActive);
            const updatedAccount = response.data;
            
            message.success(isActive ? 'Kích hoạt tài khoản thành công' : 'Vô hiệu hóa tài khoản thành công');
            
            // Cập nhật trực tiếp state với dữ liệu từ database để đảm bảo chính xác
            setAccounts(prevAccounts => 
                prevAccounts.map(account => 
                    account.id === accountId 
                        ? { 
                            ...account, 
                            ...updatedAccount,
                            // Đảm bảo giữ nguyên các field cần thiết
                            id: account.id,
                            username: account.username,
                            roles: account.roles || updatedAccount.roles
                        } 
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
                // Admin cập nhật account khác - lấy từ danh sách
                account = accounts.find(acc => acc.id === accountId);
                if (!account) {
                    message.error('Không tìm thấy tài khoản');
                    return;
                }
            } else {
                // Cập nhật tài khoản của chính mình
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
                // Kiểm tra xem có phải admin đang cập nhật account khác không
                const jwtData = decodeJWT();
                const isMyAccount = jwtData && jwtData.sub === editingAccount.username;
                
                if (isMyAccount) {
                    // Cập nhật tài khoản của chính mình
                    const response = await updateAccount(values);
                    updatedAccount = response.data;
                } else {
                    // Admin cập nhật account khác
                    const response = await updateAccountById(editingAccount.id, values);
                    updatedAccount = response.data;
                }
            } else {
                // Fallback: cập nhật tài khoản của chính mình
                const response = await updateAccount(values);
                updatedAccount = response.data;
            }
            
            message.success('Cập nhật tài khoản thành công');
            setEditModalVisible(false);
            form.resetFields();
            
            // Cập nhật account trong state với dữ liệu từ database
            if (updatedAccount && editingAccount && editingAccount.id) {
                setAccounts(prevAccounts => 
                    prevAccounts.map(account => 
                        account.id === editingAccount.id 
                            ? { 
                                ...account, 
                                ...updatedAccount,
                                // Đảm bảo giữ nguyên các field có thể không có trong response
                                id: account.id,
                                username: account.username,
                                roles: account.roles,
                                isActive: account.isActive
                            } 
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

    const formatRoles = (roles) => {
        if (!roles || roles.length === 0) return '-';
        return Array.isArray(roles) ? roles.join(', ') : roles;
    };

    const getRoleColor = (role) => {
        const roleLower = role?.toLowerCase();
        switch (roleLower) {
            case 'admin':
                return 'red';
            case 'seller':
                return 'blue';
            case 'warehouse':
                return 'orange';
            case 'customer':
                return 'green';
            default:
                return 'default';
        }
    };

    const isAdmin = () => {
        return checkAdminRole();
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
            render: (roles) => {
                if (!roles) return '-';
                
                // Xử lý roles có thể là Set, Array, hoặc object
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
                    <Space>
                        {roleArray.map((role, index) => (
                            <Tag 
                                key={index} 
                                color={getRoleColor(role)}
                                style={{
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    fontSize: '12px'
                                }}
                            >
                                {role}
                            </Tag>
                        ))}
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
                        style={{ 
                            width: '40px',
                            minWidth: '40px'
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
                const userIsAdmin = isAdmin();
                
                // Admin có thể cập nhật tất cả account, user thường chỉ cập nhật account của mình
                if (userIsAdmin || isMyAccount) {
                    return (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record.id)}
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
            <h1 style={{ marginBottom: 24 }}>Quản lý Tài khoản</h1>
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

            <Modal
                title="Cập nhật Tài khoản"
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
                    <Form.Item
                        label="Tên đăng nhập"
                    >
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
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="firstName"
                        label="Họ"
                    >
                        <Input placeholder="Họ" />
                    </Form.Item>
                    <Form.Item
                        name="lastName"
                        label="Tên"
                    >
                        <Input placeholder="Tên" />
                    </Form.Item>
                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                    >
                        <Input placeholder="Số điện thoại" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                            <Button onClick={() => {
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
        </div>
    );
};

export default AdminAccountsPage;

