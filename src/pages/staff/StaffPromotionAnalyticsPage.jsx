import React, { useEffect, useState } from 'react';
import { Card, Table, Row, Col, Statistic, message } from 'antd';
import { staffReportService } from '../../features/report/api/staffReportService';
import { adminReportService } from '../../features/report/api/adminReportService';
import { useLocation } from 'react-router-dom';

const StaffPromotionAnalyticsPage = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const reportService = isAdminRoute ? adminReportService : staffReportService;
  
  const [usage, setUsage] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([
        reportService.getPromotionUsage(),
        reportService.getPromotionTopCustomers(),
      ]);
      setUsage(u || []);
      setTopCustomers(c || []);
    } catch (err) {
      console.error('Load promotion analytics error', err);
      message.error('Không thể tải Promotion Analytics');
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = usage.reduce((s, x) => s + (x.totalOrders || 0), 0);
  const totalRevenue = usage.reduce((s, x) => s + (x.totalRevenue || 0), 0);

  const usageColumns = [
    { title: 'Mã KM', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên KM', dataIndex: 'name', key: 'name' },
    { title: 'Số đơn', dataIndex: 'totalOrders', key: 'totalOrders', width: 100 },
    {
      title: 'Doanh thu (sau giảm)',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 160,
      align: 'right',
      render: (v) => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
  ];

  const topColumns = [
    { title: 'Khách hàng', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số đơn dùng KM', dataIndex: 'totalOrders', key: 'totalOrders', width: 120 },
    {
      title: 'Tổng chi (sau giảm)',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 160,
      align: 'right',
      render: (v) => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng đơn áp KM" value={totalOrders} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Doanh thu sau giảm"
              value={totalRevenue}
              valueStyle={{ color: '#ff6b35' }}
              formatter={(v) =>
                Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
              }
            />
          </Card>
        </Col>
      </Row>

      <Card title="Hiệu quả khuyến mãi" loading={loading} style={{ marginBottom: 16 }}>
        <Table dataSource={usage} columns={usageColumns} rowKey={(r) => r.code} pagination={false} />
      </Card>

      <Card title="Top khách hàng dùng khuyến mãi" loading={loading}>
        <Table dataSource={topCustomers} columns={topColumns} rowKey={(r) => r.customerId} pagination={false} />
      </Card>
    </div>
  );
};

export default StaffPromotionAnalyticsPage;

