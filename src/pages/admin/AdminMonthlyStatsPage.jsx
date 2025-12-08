import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, message, Button, Space, Statistic, Row, Col, Tag, Select } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMonthlyStats } from '../../features/dashboard/api/dashboardService';

const AdminMonthlyStatsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(null);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const fetchData = async (targetYear = year) => {
    try {
      setLoading(true);
      const res = await getMonthlyStats(12, targetYear || undefined);
      setData(res.data || []);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      message.error('Không thể tải thống kê theo tháng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // initial load

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, []);

  const statsWithChange = useMemo(() => {
    if (!data || data.length === 0) return [];
    // data đã sort theo backend, nhưng đảm bảo sort tăng dần theo năm/tháng
    const sorted = [...data].sort((a, b) => (a.year - b.year) || (a.month - b.month));
    return sorted.map((item, idx) => {
      const prev = idx > 0 ? sorted[idx - 1] : null;
      const revenueDiff = prev ? item.revenue - prev.revenue : 0;
      const ordersDiff = prev ? item.orders - prev.orders : 0;
      const revenueChangePercent = prev && prev.revenue > 0 ? (revenueDiff / prev.revenue) * 100 : (prev ? (item.revenue > 0 ? 100 : 0) : 0);
      const ordersChangePercent = prev && prev.orders > 0 ? (ordersDiff / prev.orders) * 100 : (prev ? (item.orders > 0 ? 100 : 0) : 0);
      return {
        ...item,
        revenueDiff,
        ordersDiff,
        revenueChangePercent,
        ordersChangePercent,
      };
    });
  }, [data]);

  const totalRevenue = useMemo(() => statsWithChange.reduce((s, i) => s + (i.revenue || 0), 0), [statsWithChange]);
  const totalOrders = useMemo(() => statsWithChange.reduce((s, i) => s + (i.orders || 0), 0), [statsWithChange]);
  const latest = useMemo(() => (statsWithChange.length ? statsWithChange[statsWithChange.length - 1] : null), [statsWithChange]);
  const prev = useMemo(() => (statsWithChange.length > 1 ? statsWithChange[statsWithChange.length - 2] : null), [statsWithChange]);

  const renderChangeTag = (value) => {
    if (value === undefined || value === null) return null;
    if (value === 0) return <Tag color="default">0%</Tag>;
    const positive = value > 0;
    return (
      <Tag color={positive ? 'green' : 'red'} icon={positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
        {`${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
      render: (_, record) => `${record.month.toString().padStart(2, '0')}/${record.year}`,
      width: 120,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => formatCurrency(value),
      align: 'right',
    },
    {
      title: 'Số đơn hoàn tất',
      dataIndex: 'orders',
      key: 'orders',
      align: 'right',
      width: 160,
    },
    {
      title: 'So với tháng trước (doanh thu)',
      key: 'revenueChangePercent',
      dataIndex: 'revenueChangePercent',
      render: (value) => renderChangeTag(value),
      width: 180,
    },
    {
      title: 'So với tháng trước (số đơn)',
      key: 'ordersChangePercent',
      dataIndex: 'ordersChangePercent',
      render: (value) => renderChangeTag(value),
      width: 180,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/dashboard')}>
          Quay lại Dashboard
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => fetchData(year)} loading={loading}>
          Làm mới
        </Button>
        <Select
          allowClear
          placeholder="Chọn năm (mặc định 12 tháng gần nhất)"
          style={{ width: 260 }}
          value={year}
          onChange={(val) => {
            setYear(val || null);
            fetchData(val || null);
          }}
          options={yearOptions.map((y) => ({ label: y.toString(), value: y }))}
        />
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic title="Tổng doanh thu 12 tháng" value={formatCurrency(totalRevenue)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic title="Tổng số đơn 12 tháng" value={totalOrders} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Tháng gần nhất vs trước đó (doanh thu)"
              valueRender={() =>
                latest && prev ? renderChangeTag(latest.revenueChangePercent) : <span>—</span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Thống kê theo tháng (đơn hoàn tất)"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={columns}
          dataSource={statsWithChange}
          rowKey={(record) => `${record.year}-${record.month}`}
          pagination={false}
          loading={loading}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default AdminMonthlyStatsPage;

