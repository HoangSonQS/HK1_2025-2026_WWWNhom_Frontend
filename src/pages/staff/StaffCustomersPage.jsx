import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { staffCustomerService } from '../../features/customer/api/staffCustomerService';
import { adminCustomerService } from '../../features/customer/api/adminCustomerService';
import { useNavigate, useLocation } from 'react-router-dom';

const StaffCustomersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin/customers' : '/staff/customers';

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const service = isAdminRoute ? adminCustomerService : staffCustomerService;
      const res = await service.getCustomers();
      setData(res || []);
    } catch (err) {
      console.error('Error loading customers', err);
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 140 },
    {
      title: 'Tổng đơn',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      width: 110,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Tổng chi',
      dataIndex: 'totalSpending',
      key: 'totalSpending',
      width: 150,
      render: (val) => <strong style={{ color: '#ff6b35' }}>{formatCurrency(val)}</strong>,
    },
    {
      title: 'Đơn gần nhất',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      width: 180,
      render: (val) => formatDateTime(val),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => navigate(`${basePath}/${record.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card title="Khách hàng" bordered={false}>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  );
};

export default StaffCustomersPage;

