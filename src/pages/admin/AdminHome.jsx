import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { BookOutlined, FolderOutlined, UserOutlined, ShoppingOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary, getTopSellingProducts } from '../../features/dashboard/api/dashboardService';

const AdminHome = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingSummary(true);
            setLoadingProducts(true);
            try {
                const [summaryResponse, productsResponse] = await Promise.all([
                    getDashboardSummary(),
                    getTopSellingProducts()
                ]);
                setSummary(summaryResponse.data);
                setTopProducts(productsResponse.data || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                message.error('Không thể tải dữ liệu thống kê');
            } finally {
                setLoadingSummary(false);
                setLoadingProducts(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const formatPercent = (value) => {
        if (value === null || value === undefined) return '0%';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    const productColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên sách',
            dataIndex: 'bookTitle',
            key: 'bookTitle',
            ellipsis: true,
        },
        {
            title: 'Số lượng đã bán',
            dataIndex: 'totalSold',
            key: 'totalSold',
            width: 150,
            align: 'right',
            render: (value) => (
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {value.toLocaleString('vi-VN')} cuốn
                </Tag>
            ),
        },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Dashboard Quản trị</h1>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={12}>
                    <Card
                        bordered={false}
                        hoverable
                        onClick={() => navigate('/admin/statistics/monthly')}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            minHeight: 140
                        }}
                    >
                        <Statistic
                            title="Tổng doanh thu tháng này (đơn đã hoàn tất)"
                            value={summary ? formatCurrency(summary.totalRevenue) : '0 ₫'}
                            valueStyle={{ color: '#3f8600', fontSize: 28 }}
                            prefix={loadingSummary ? <Spin size="small" /> : null}
                            suffix={
                                summary && summary.revenueChangePercent !== undefined ? (
                                    <span style={{
                                        fontSize: 14,
                                        color: summary.revenueChangePercent >= 0 ? '#3f8600' : '#cf1322',
                                        marginLeft: 8
                                    }}>
                                        {summary.revenueChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        {formatPercent(summary.revenueChangePercent)} so với tháng trước
                                    </span>
                                ) : null
                            }
                        />
                        {summary && summary.previousMonthRevenue !== undefined && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                                Tháng trước: {formatCurrency(summary.previousMonthRevenue)}
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12}>
                    <Card
                        bordered={false}
                        hoverable
                        onClick={() => navigate('/admin/statistics/monthly')}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            minHeight: 140
                        }}
                    >
                        <Statistic
                            title="Tổng số đơn đã hoàn tất tháng này"
                            value={summary?.totalOrders || 0}
                            valueStyle={{ color: '#1890ff', fontSize: 28 }}
                            suffix={
                                loadingSummary ? <Spin size="small" /> : (
                                    summary && summary.ordersChangePercent !== undefined ? (
                                        <span style={{
                                            fontSize: 14,
                                            color: summary.ordersChangePercent >= 0 ? '#3f8600' : '#cf1322',
                                            marginLeft: 8
                                        }}>
                                            {summary.ordersChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                            {formatPercent(summary.ordersChangePercent)} so với tháng trước
                                        </span>
                                    ) : null
                                )
                            }
                        />
                        {summary && summary.previousMonthOrders !== undefined && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                                Tháng trước: {summary.previousMonthOrders} đơn
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24}>
                    <Card
                        title="Top 5 Sản phẩm bán chạy nhất"
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                        loading={loadingProducts}
                    >
                        <Table
                            columns={productColumns}
                            dataSource={topProducts}
                            rowKey="bookId"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/books')}
                        style={{ textAlign: 'center' }}
                    >
                        <BookOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                        <h3>Quản lý Sách</h3>
                        <p>Thêm, sửa, xóa sách</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/categories')}
                        style={{ textAlign: 'center' }}
                    >
                        <FolderOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                        <h3>Quản lý Thể loại</h3>
                        <p>Thêm thể loại mới</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/accounts')}
                        style={{ textAlign: 'center' }}
                    >
                        <UserOutlined style={{ fontSize: 48, color: '#ff6b35', marginBottom: 16 }} />
                        <h3>Quản lý Tài khoản</h3>
                        <p>Xem và cập nhật tài khoản</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/orders')}
                        style={{ textAlign: 'center' }}
                    >
                        <ShoppingOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                        <h3>Quản lý Đơn hàng</h3>
                        <p>Xem và quản lý đơn hàng</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card 
                        hoverable
                        onClick={() => navigate('/admin/promotions')}
                        style={{ textAlign: 'center' }}
                    >
                        <GiftOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                        <h3>Quản lý Khuyến mãi</h3>
                        <p>Tạo và quản lý khuyến mãi</p>
                    </Card>
                </Col>
            </Row>

        </div>
    );
};

export default AdminHome;

