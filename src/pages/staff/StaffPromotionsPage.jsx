import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, message, Tag, Tabs, Input, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { 
    getAllPromotions,
    getPromotionLogsByDateRange
} from '../../features/promotion/api/staffPromotionService';
import StaffPromotionModal from './components/StaffPromotionModal';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';

const { RangePicker } = DatePicker;

const getDefaultLogRange = () => [dayjs('2000-01-01'), dayjs()];

const StaffPromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promotionModalOpen, setPromotionModalOpen] = useState(false);
    const [editingPromotionId, setEditingPromotionId] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [logDateRange, setLogDateRange] = useState([]);
    const [logAction, setLogAction] = useState(null);
    const [logEntries, setLogEntries] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedPromotionId, setSelectedPromotionId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        loadPromotions();
    }, []);

    // Đọc query params để mở tab logs và filter promotion
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const pId = params.get('promotionId');
        if (tab === 'logs') {
            setActiveTab('logs');
            if (pId) {
                const numId = Number(pId);
                if (!Number.isNaN(numId)) {
                    setSelectedPromotionId(numId);
                }
            }
        }
    }, [location.search]);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const response = await getAllPromotions();
            const promotionsData = response.data || [];
            
            // Sắp xếp theo ID tăng dần
            const sortedPromotions = [...promotionsData].sort((a, b) => {
                const idA = a.id || 0;
                const idB = b.id || 0;
                return idA - idB;
            });
            
            setPromotions(sortedPromotions);
        } catch (error) {
            console.error('Error loading promotions:', error);
            if (error.response?.status === 401) {
                message.warning('Vui lòng đăng nhập để xem khuyến mãi');
            } else {
                message.error('Không thể tải danh sách khuyến mãi');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddPromotion = () => {
        setEditingPromotionId(null);
        setPromotionModalOpen(true);
    };

    const handlePromotionModalSuccess = (updatedPromotion) => {
        setPromotionModalOpen(false);
        setEditingPromotionId(null);
        
        if (updatedPromotion) {
            // Thêm khuyến mãi mới vào danh sách
            setPromotions(prevPromotions => {
                const updated = [...prevPromotions, updatedPromotion];
                return updated.sort((a, b) => {
                    const idA = a.id || 0;
                    const idB = b.id || 0;
                    return idA - idB;
                });
            });
        } else {
            // Fallback: reload nếu không có dữ liệu
            loadPromotions();
        }
    };

    const handlePromotionModalCancel = () => {
        setPromotionModalOpen(false);
        setEditingPromotionId(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return 'Không giới hạn';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const isExpired = (endDate) => {
        if (!endDate) return false;
        return dayjs(endDate).isBefore(dayjs(), 'day');
    };

    const isActive = (promotion) => {
        if (!promotion.isActive) return false;
        if (isExpired(promotion.endDate)) return false;
        const now = dayjs();
        const startDate = dayjs(promotion.startDate);
        return now.isAfter(startDate) || now.isSame(startDate, 'day');
    };

    const filteredPromotions = useMemo(() => {
        let filtered = promotions;

        if (activeTab === 'active') {
            filtered = filtered.filter(p => {
                const status = p.status || (p.isApproved ? 'ACTIVE' : 'PENDING');
                return status === 'ACTIVE' && isActive(p) && !isExpired(p.endDate);
            });
        } else if (activeTab === 'pending') {
            filtered = filtered.filter(p => {
                const status = p.status || (p.isApproved ? 'ACTIVE' : 'PENDING');
                return status === 'PENDING' || (!p.isApproved && !p.status);
            });
        } else if (activeTab === 'expired') {
            filtered = filtered.filter(p => isExpired(p.endDate));
        }

        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            filtered = filtered.filter(p => 
                p.name?.toLowerCase().includes(keyword) ||
                p.code?.toLowerCase().includes(keyword)
            );
        }

        return filtered;
    }, [promotions, activeTab, searchKeyword]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            render: (percent) => <Tag color="green">{percent}%</Tag>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'priceOrderActive',
            key: 'priceOrderActive',
            render: (price) => formatPrice(price),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => formatDate(date),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => formatDate(date),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const expired = isExpired(record.endDate);
                // Ưu tiên dùng status từ backend, fallback về isApproved nếu không có
                const status = record.status || (record.isApproved ? 'ACTIVE' : 'PENDING');
                
                if (status === 'PENDING' || (!record.isApproved && !record.status)) {
                    return <Tag color="orange">Chờ duyệt</Tag>;
                }
                if (status === 'REJECTED') {
                    return <Tag color="red">Từ chối</Tag>;
                }
                if (status === 'PAUSED') {
                    return <Tag color="default">Tạm dừng</Tag>;
                }
                if (expired) {
                    return <Tag color="red">Hết hạn</Tag>;
                }
                if (status === 'ACTIVE' && isActive(record)) {
                    return <Tag color="green">Đang hoạt động</Tag>;
                }
                return <Tag color="default">Chưa bắt đầu</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => navigate(`/staff/promotions/${record.id}`)}
                    >
                        Xem chi tiết
                    </Button>
                    {(record.status === 'PENDING' || (!record.isApproved && !record.status)) && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={async () => {
                                try {
                                    const { approvePromotion } = await import('../../features/promotion/api/staffPromotionService');
                                    await approvePromotion(record.id);
                                    message.success('Duyệt khuyến mãi thành công');
                                    loadPromotions();
                                } catch (error) {
                                    console.error('Error approving promotion:', error);
                                    message.error('Duyệt khuyến mãi thất bại');
                                }
                            }}
                        >
                            Duyệt
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const tabItems = [
        { key: 'all', label: 'Tất cả' },
        { key: 'active', label: 'Đang hoạt động' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'expired', label: 'Hết hạn' },
        { key: 'logs', label: 'Nhật ký hoạt động' },
    ];

    const fetchLogsByRange = useCallback(async (rangeToUse, options = {}) => {
        const { silent = false } = options;
        if (!rangeToUse || rangeToUse.length !== 2) {
            if (!silent) message.warning('Vui lòng chọn khoảng ngày để xem nhật ký khuyến mãi');
            return;
        }
        const [start, end] = rangeToUse;
        if (!start || !end) {
            if (!silent) message.warning('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc');
            return;
        }
        try {
            setLogsLoading(true);
            const startDate = start.format('YYYY-MM-DD');
            const endDate = end.format('YYYY-MM-DD');
            const response = await getPromotionLogsByDateRange(startDate, endDate);
            setLogEntries(response.data || []);
        } catch (error) {
            console.error('Error loading promotion logs:', error);
            if (!silent) message.error('Không thể tải nhật ký khuyến mãi theo khoảng thời gian đã chọn');
        } finally {
            setLogsLoading(false);
        }
    }, []);

    const handleFetchLogs = (rangeOverride) => {
        fetchLogsByRange(rangeOverride || logDateRange);
    };

    const filteredLogs = useMemo(() => {
        let logs = logEntries;
        if (selectedPromotionId) {
            logs = logs.filter((log) => Number(log.promotionId) === Number(selectedPromotionId));
        }
        if (logAction) {
            logs = logs.filter((log) => log.action === logAction);
        }
        return logs;
    }, [logEntries, logAction, selectedPromotionId]);

    useEffect(() => {
        if (activeTab === 'logs') {
            let range = logDateRange;
            if (!range || range.length !== 2) {
                range = getDefaultLogRange();
                setLogDateRange(range);
            }
            fetchLogsByRange(range, { silent: true });
        }
    }, [activeTab, logDateRange, fetchLogsByRange]);

    const logColumns = [
        {
            title: 'ID khuyến mãi',
            dataIndex: 'promotionId',
            key: 'promotionId',
            width: 120,
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'promotionCode',
            key: 'promotionCode',
            width: 150,
            render: (code) => (
                <Tag color="blue" style={{ fontWeight: 'bold', fontSize: '13px', padding: '4px 12px', borderRadius: '4px' }}>
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            width: 140,
            render: (action) => {
                const actionColors = {
                    CREATE: { bg: '#f3e8ff', border: '#b37feb', text: '#531dab' },
                    APPROVE: { bg: '#f6ffed', border: '#b7eb8f', text: '#237804' },
                    REJECT: { bg: '#fff1f0', border: '#ffa39e', text: '#a8071a' },
                    PAUSE: { bg: '#fff7e6', border: '#ffd591', text: '#ad4e00' },
                    RESUME: { bg: '#e6fffb', border: '#87e8de', text: '#006d75' },
                };
                const colorConfig = actionColors[action] || { bg: '#f3e8ff', border: '#b37feb', text: '#531dab' };
                return (
                    <Tag style={{ backgroundColor: colorConfig.bg, borderColor: colorConfig.border, color: colorConfig.text, borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>
                        {action}
                    </Tag>
                );
            },
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'actorName',
            key: 'actorName',
            width: 160,
        },
        {
            title: 'Thời gian',
            dataIndex: 'logTime',
            key: 'logTime',
            width: 200,
            render: (time) => (time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-'),
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
                <h1 style={{ margin: 0 }}>Quản lý Khuyến mãi</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAddPromotion}
                >
                    Tạo khuyến mãi mới
                </Button>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm theo tên hoặc mã khuyến mãi"
                    allowClear
                    onSearch={setSearchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ width: 400 }}
                />
            </div>

            <Tabs
                activeKey={activeTab}
                items={tabItems}
                onChange={setActiveTab}
            />

            {activeTab === 'logs' ? (
                <div>
                    <div style={{
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 16,
                    }}>
                        <RangePicker
                            format="DD/MM/YYYY"
                            size="large"
                            allowClear
                            onChange={(values) => setLogDateRange(values || [])}
                            value={logDateRange}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            style={{
                                flex: '1 1 260px',
                                minWidth: 240,
                                height: 44,
                                borderRadius: 10,
                                padding: '6px 12px'
                            }}
                        />
                        <Select
                            allowClear
                            placeholder="Chọn hành động"
                            size="large"
                            value={logAction}
                            onChange={(value) => setLogAction(value || null)}
                            style={{
                                flex: '0 0 220px',
                                minWidth: 220,
                            }}
                            options={[
                                { label: 'CREATE', value: 'CREATE' },
                                { label: 'APPROVE', value: 'APPROVE' },
                                { label: 'REJECT', value: 'REJECT' },
                                { label: 'PAUSE', value: 'PAUSE' },
                                { label: 'RESUME', value: 'RESUME' },
                            ]}
                        />
                        <Button
                            onClick={handleFetchLogs}
                            size="large"
                            type="primary"
                            style={{
                                flex: '0 0 auto',
                                height: 44,
                                borderRadius: 10,
                                fontWeight: 600,
                                padding: '0 28px'
                            }}
                        >
                            Tải nhật ký
                        </Button>
                    </div>
                    <Table
                        columns={logColumns}
                        dataSource={filteredLogs}
                        rowKey={(record, index) => `${record.promotionId}-${record.action}-${record.logTime}-${index}`}
                        loading={logsLoading}
                        bordered
                        pagination={{
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} nhật ký`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        scroll={{ x: 900 }}
                    />
                </div>
            ) : (
            <Table
                columns={columns}
                dataSource={filteredPromotions}
                rowKey="id"
                loading={loading}
                pagination={{
                        defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} khuyến mãi`,
                }}
            />
            )}

            <StaffPromotionModal
                open={promotionModalOpen}
                onCancel={handlePromotionModalCancel}
                onSuccess={handlePromotionModalSuccess}
                promotionId={editingPromotionId}
            />
        </div>
    );
};

export default StaffPromotionsPage;

