import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Spin, message, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, BookOutlined, ShoppingOutlined, GiftOutlined, ShopOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { checkSellerStaffRole, checkWarehouseStaffRole } from '../../utils/jwt';
import { getDashboardSummary, getTopSellingProducts, getWarehouseSummary } from '../../features/dashboard/api/staffDashboardService';

const { Title } = Typography;

const StaffHome = () => {
    const navigate = useNavigate();
    const isSeller = checkSellerStaffRole(true); // useStaffToken = true
    const isWarehouse = checkWarehouseStaffRole(true); // useStaffToken = true
    const [summary, setSummary] = useState(null);
    const [warehouseSummary, setWarehouseSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const sellerStats = [
        {
            title: 'Tổng số sách',
            value: 0,
            icon: <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
            onClick: () => navigate('/staff/books'),
        },
        {
            title: 'Tổng số đơn hàng',
            value: 0,
            icon: <ShoppingOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
            onClick: () => navigate('/staff/orders'),
        },
        {
            title: 'Tổng số khuyến mãi',
            value: 0,
            icon: <GiftOutlined style={{ fontSize: 24, color: '#ff6b35' }} />,
            onClick: () => navigate('/staff/promotions'),
        },
    ];

    const warehouseStats = [
        {
            title: 'Tổng số sách',
            value: warehouseSummary?.totalBooks || 0,
            icon: <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
            onClick: () => navigate('/staff/books'),
        },
        {
            title: 'Tổng số nhà cung cấp',
            value: warehouseSummary?.totalSuppliers || 0,
            icon: <ShopOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
            onClick: () => navigate('/staff/suppliers'),
        },
        {
            title: 'Tổng số phiếu nhập',
            value: warehouseSummary?.totalImportStocks || 0,
            icon: <InboxOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
            onClick: () => navigate('/staff/import-stocks'),
        },
    ];

    useEffect(() => {
        if (isSeller) {
            // Load thống kê cho seller
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
                    // Không hiển thị lỗi nếu không có quyền (có thể backend chưa cho phép staff)
                    if (error.response?.status !== 403) {
                        message.error('Không thể tải dữ liệu thống kê');
                    }
                } finally {
                    setLoadingSummary(false);
                    setLoadingProducts(false);
                }
            };
            fetchData();
        } else if (isWarehouse) {
            // Load thống kê cho warehouse
            const fetchData = async () => {
                setLoadingSummary(true);
                try {
                    const warehouseResponse = await getWarehouseSummary();
                    setWarehouseSummary(warehouseResponse.data);
                } catch (error) {
                    console.error('Error fetching warehouse dashboard data:', error);
                    if (error.response?.status !== 403) {
                        message.error('Không thể tải dữ liệu thống kê');
                    }
                } finally {
                    setLoadingSummary(false);
                }
            };
            fetchData();
        }
    }, [isSeller, isWarehouse]);

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

    const stats = isSeller ? sellerStats : warehouseStats;

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>
                {isSeller ? 'Dashboard - Nhân viên Bán hàng' : 'Dashboard - Nhân viên Kho'}
            </Title>

            {/* Thống kê cho Seller */}
            {isSeller && summary && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={12}>
                            <Card
                                bordered={false}
                                style={{
                                    borderRadius: 12,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    minHeight: 140
                                }}
                            >
                                <Statistic
                                    title="Tổng doanh thu tháng này (đơn đã hoàn tất)"
                                    value={formatCurrency(summary.totalRevenue)}
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

                    {topProducts && topProducts.length > 0 && (
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
                    )}
                </>
            )}
            
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                            hoverable
                            onClick={stat.onClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card style={{ marginTop: 24 }}>
                <Title level={4}>Chào mừng đến với hệ thống quản lý SEBook</Title>
                <p>
                    {isSeller 
                        ? 'Bạn đang đăng nhập với quyền Nhân viên Bán hàng. Bạn có thể quản lý sách, thể loại, đơn hàng và khuyến mãi.'
                        : 'Bạn đang đăng nhập với quyền Nhân viên Kho. Bạn có thể quản lý sách, nhà cung cấp và phiếu nhập kho.'}
                </p>
            </Card>
        </div>
    );
};

export default StaffHome;

