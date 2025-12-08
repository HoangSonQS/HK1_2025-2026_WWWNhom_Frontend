import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Descriptions, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { staffCustomerService } from '../../features/customer/api/staffCustomerService';
import { adminCustomerService } from '../../features/customer/api/adminCustomerService';

const StaffCustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin/customers' : '/staff/customers';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const service = isAdminRoute ? adminCustomerService : staffCustomerService;
      const res = await service.getCustomerDetail(id);
      setData(res);
    } catch (err) {
      console.error('Error load customer detail', err);
      message.error('Không thể tải chi tiết khách hàng');
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
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 180,
      render: (val) => formatDateTime(val),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'CANCELLED' ? 'red' : 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (val) => <strong style={{ color: '#ff6b35' }}>{formatCurrency(val)}</strong>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'orderDetails',
      key: 'orderDetails',
      render: (details) => {
        if (!details || details.length === 0) return '-';
        return details.map((d) => `${d.bookTitle} x${d.quantity}`).join(', ');
      },
    },
  ];

  const summary = data?.summary;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(basePath)}>
          Quay lại
        </Button>
      </div>

      {summary && (
        <Card title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
          <Descriptions column={2}>
            <Descriptions.Item label="Họ tên">{summary.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{summary.email}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{summary.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Tổng đơn">
              <Tag color="blue">{summary.totalOrders}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng chi">
              <strong style={{ color: '#ff6b35' }}>{formatCurrency(summary.totalSpending)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn gần nhất">
              {summary.lastOrderDate ? formatDateTime(summary.lastOrderDate) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title="Lịch sử đơn hàng">
        <Table
          dataSource={data?.orders || []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};

export default StaffCustomerDetailPage;

