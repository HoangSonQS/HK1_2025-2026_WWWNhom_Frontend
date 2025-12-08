import React, { useEffect, useState } from 'react';
import { Card, Table, DatePicker, Row, Col, Statistic, Tag, message, Space } from 'antd';
import { staffReportService } from '../../features/report/api/staffReportService';
import { adminReportService } from '../../features/report/api/adminReportService';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const StaffReportsPage = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const reportService = isAdminRoute ? adminReportService : staffReportService;
  
  const [range, setRange] = useState([dayjs().add(-6, 'day'), dayjs()]);
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [invSummary, setInvSummary] = useState({ totalQuantity: 0, totalValue: 0 });
  const [invCategories, setInvCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async (customRange = range) => {
    const [start, end] = customRange;
    if (!start || !end) return;
    setLoading(true);
    try {
      const startStr = start.format('YYYY-MM-DD');
      const endStr = end.add(1, 'day').format('YYYY-MM-DD'); // end exclusive
      const [rev, status, top, low, invSum, invCat] = await Promise.all([
        reportService.getRevenue(startStr, endStr),
        reportService.getStatusCounts(startStr, endStr),
        reportService.getTopProducts(),
        reportService.getLowStock(10),
        reportService.getInventorySummary(),
        reportService.getInventoryByCategory(),
      ]);
      setRevenueData(rev || []);
      setStatusData(status || []);
      setTopProducts(top || []);
      setLowStock(low || []);
      setInvSummary(invSum || { totalQuantity: 0, totalValue: 0 });
      setInvCategories(invCat || []);
    } catch (err) {
      console.error('Load reports error', err);
      message.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((s, r) => s + (r.revenue || 0), 0);
  const totalOrders = revenueData.reduce((s, r) => s + (r.orders || 0), 0);

  const revenueColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (d) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (v) => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
    { title: 'Số đơn', dataIndex: 'orders', key: 'orders', align: 'right' },
  ];

  const statusColumns = [
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Số đơn', dataIndex: 'count', key: 'count', align: 'right' },
  ];

  const topColumns = [
    { title: 'Mã sách', dataIndex: 'bookId', key: 'bookId', width: 90 },
    { title: 'Tên sách', dataIndex: 'bookTitle', key: 'bookTitle' },
    { title: 'Đã bán', dataIndex: 'totalSold', key: 'totalSold', align: 'right' },
  ];

  const lowColumns = [
    { title: 'Mã sách', dataIndex: 'bookId', key: 'bookId', width: 90 },
    { title: 'Tên sách', dataIndex: 'title', key: 'title' },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q) => <Tag color={q <= 0 ? 'red' : 'orange'}>{q}</Tag>,
      align: 'right',
    },
  ];

  const categoryColumns = [
    { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Số lượng', dataIndex: 'totalQuantity', key: 'totalQuantity', align: 'right' },
    {
      title: 'Giá trị tồn',
      dataIndex: 'totalValue',
      key: 'totalValue',
      align: 'right',
      render: (v) => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ marginBottom: 12 }} size="middle">
          <span>Khoảng thời gian:</span>
          <RangePicker
            value={range}
            onChange={(val) => {
              setRange(val);
              if (val && val[0] && val[1]) loadAll(val);
            }}
            format="DD/MM/YYYY"
          />
        </Space>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Tổng doanh thu (range)"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#ff6b35' }}
              formatter={(v) =>
                Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
              }
            />
          </Col>
          <Col span={6}>
            <Statistic title="Tổng đơn (range)" value={totalOrders} />
          </Col>
        </Row>
      </Card>

      <Card title="Doanh thu theo ngày" loading={loading}>
        <Table
          dataSource={revenueData}
          columns={revenueColumns}
          rowKey={(r) => r.date}
          pagination={false}
        />
      </Card>

      <Card title="Số đơn theo trạng thái" loading={loading}>
        <Table dataSource={statusData} columns={statusColumns} rowKey={(r) => r.status} pagination={false} />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Top sản phẩm bán chạy" loading={loading}>
            <Table dataSource={topProducts} columns={topColumns} rowKey={(r) => r.bookId} pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Cảnh báo tồn kho thấp" loading={loading}>
            <Table dataSource={lowStock} columns={lowColumns} rowKey={(r) => r.bookId} pagination={false} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Tồn kho theo danh mục" loading={loading}>
            <Table dataSource={invCategories} columns={categoryColumns} rowKey={(r) => r.categoryId} pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Tổng tồn kho" loading={loading}>
            <Statistic title="Tổng số lượng" value={invSummary?.totalQuantity || 0} />
            <Statistic
              title="Tổng giá trị"
              value={invSummary?.totalValue || 0}
              valueStyle={{ color: '#ff6b35' }}
              formatter={(v) =>
                Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
              }
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default StaffReportsPage;

