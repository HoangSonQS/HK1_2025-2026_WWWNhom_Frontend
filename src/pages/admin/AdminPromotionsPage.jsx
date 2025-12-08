import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, message, Tag, Tabs, Input, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getPromotionLogsByDateRange } from '../../features/promotion/api/promotionService';
import { adminPromotionService } from '../../features/promotion/api/adminPromotionService';
import PromotionModal from './components/PromotionModal';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;

const getDefaultLogRange = () => [dayjs('2000-01-01'), dayjs()];

const AdminPromotionsPage = () => {
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
    const navigate = useNavigate();

    const handleApprove = async (id) => {
        try {
            await adminPromotionService.approve(id);
            message.success('Duyệt khuyến mãi thành công');
            loadPromotions();
        } catch (error) {
            console.error('Error approving promotion:', error);
            message.error(error.response?.data?.message || 'Duyệt khuyến mãi thất bại');
        }
    };

    const handlePause = async (id) => {
        try {
            await adminPromotionService.pause(id);
            message.success('Tạm dừng khuyến mãi');
            loadPromotions();
        } catch (error) {
            console.error('Error pausing promotion:', error);
            message.error(error.response?.data?.message || 'Tạm dừng thất bại');
        }
    };

    const handleResume = async (id) => {
        try {
            await adminPromotionService.resume(id);
            message.success('Kích hoạt lại khuyến mãi');
            loadPromotions();
        } catch (error) {
            console.error('Error resuming promotion:', error);
            message.error(error.response?.data?.message || 'Kích hoạt lại thất bại');
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await adminPromotionService.deactivate(id);
            message.success('Xóa (deactivate) khuyến mãi thành công');
            loadPromotions();
        } catch (error) {
            console.error('Error deactivating promotion:', error);
            message.error(error.response?.data?.message || 'Xóa thất bại');
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const response = await adminPromotionService.getAll();
            const promotionsData = response || [];
            
            // Sắp xếp theo ID tăng dần
            const sortedPromotions = [...promotionsData].sort((a, b) => {
                const idA = a.id || 0;
                const idB = b.id || 0;
                return idA - idB;
            });
            
            setPromotions(sortedPromotions);
        } catch (error) {
            console.error('Error loading promotions:', error);
            message.error('Không thể tải danh sách khuyến mãi');
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

    const fetchLogsByRange = useCallback(async (rangeToUse, options = {}) => {
        const { silent = false } = options;
        if (!rangeToUse || rangeToUse.length !== 2) {
            if (!silent) {
                message.warning('Vui lòng chọn khoảng ngày để xem nhật ký khuyến mãi');
            }
            return;
        }

        const [start, end] = rangeToUse;
        if (!start || !end) {
            if (!silent) {
                message.warning('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc');
            }
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
            if (!silent) {
                message.error('Không thể tải nhật ký khuyến mãi theo khoảng thời gian đã chọn');
            }
        } finally {
            setLogsLoading(false);
        }
    }, []);

    const handleFetchLogs = (rangeOverride) => {
        fetchLogsByRange(rangeOverride || logDateRange);
    };

    const filteredLogs = useMemo(() => {
        if (!logAction) return logEntries;
        return logEntries.filter((log) => log.action === logAction);
    }, [logEntries, logAction]);

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
    const filteredPromotions = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return promotions;
        return promotions.filter(promo => {
            const name = promo.name?.toLowerCase() || '';
            const code = promo.code?.toLowerCase() || '';
            return name.includes(keyword) || code.includes(keyword);
        });
    }, [promotions, searchKeyword]);

    const pendingPromotions = useMemo(
        () => filteredPromotions.filter(promo => promo.status === 'PENDING'),
        [filteredPromotions]
    );

    const approvedPromotions = useMemo(
        () => filteredPromotions.filter(promo => promo.status === 'ACTIVE'),
        [filteredPromotions]
    );

    const activePromotions = useMemo(
        () => filteredPromotions.filter(promo => {
            const status = promo.status || (promo.isApproved ? 'ACTIVE' : 'PENDING');
            return status === 'ACTIVE' && isActive(promo) && !isExpired(promo.endDate);
        }),
        [filteredPromotions]
    );

    const rejectedPromotions = useMemo(
        () => filteredPromotions.filter(promo => promo.status === 'REJECTED'),
        [filteredPromotions]
    );

    const pausedPromotions = useMemo(
        () => filteredPromotions.filter(promo => promo.status === 'PAUSED'),
        [filteredPromotions]
    );

    const displayedPromotions = useMemo(() => {
        if (activeTab === 'active') {
            return activePromotions;
        }
        if (activeTab === 'pending') {
            return pendingPromotions;
        }
        if (activeTab === 'approved') {
            return approvedPromotions;
        }
        if (activeTab === 'rejected') {
            return rejectedPromotions;
        }
        if (activeTab === 'paused') {
            return pausedPromotions;
        }
        return filteredPromotions;
    }, [filteredPromotions, pendingPromotions, approvedPromotions, activePromotions, rejectedPromotions, pausedPromotions, activeTab]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            align: 'center',
        },
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
            width: 110,
            align: 'center',
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            width: 90,
            align: 'center',
            render: (percent) => <Tag color="green">{percent}%</Tag>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 90,
            align: 'center',
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'priceOrderActive',
            key: 'priceOrderActive',
            width: 130,
            render: (price) => formatPrice(price),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120,
            render: (date) => formatDate(date),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 120,
            render: (date) => formatDate(date),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const expired = isExpired(record.endDate);
                const approved = record.isApproved ?? record.status === 'ACTIVE';
                
                if (!approved || record.status === 'PENDING') {
                    return <Tag color="orange">Chờ duyệt</Tag>;
                }
                if (record.status === 'REJECTED') {
                    return <Tag color="red">Từ chối</Tag>;
                }
                if (record.status === 'PAUSED') {
                    return <Tag color="default">Tạm dừng</Tag>;
                }
                if (expired) {
                    return <Tag color="red">Hết hạn</Tag>;
                }
                // Kiểm tra xem đã đến thời gian bắt đầu chưa
                if (approved && record.status === 'ACTIVE' && isActive(record)) {
                    return <Tag color="green">Đang hoạt động</Tag>;
                }
                // Đã duyệt nhưng chưa đến thời gian bắt đầu
                if (approved && record.status === 'ACTIVE' && !isActive(record)) {
                    return <Tag color="default">Chưa bắt đầu</Tag>;
                }
                return <Tag color="green">Đang hoạt động</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            render: (_, record) => {
                const actions = [];
                const approved = record.isApproved ?? record.status === 'ACTIVE';
                const isPaused = record.status === 'PAUSED';

                actions.push(
                    <Button
                        key="detail"
                        type="link"
                        size="small"
                        onClick={() => navigate(`/admin/promotions/${record.id}`)}
                    >
                        Xem chi tiết
                    </Button>
                );

                if (!approved) {
                    actions.push(
                        <Button
                            key="approve"
                            type="primary"
                            size="small"
                            style={{ padding: '0 8px' }}
                            onClick={() => handleApprove(record.id)}
                        >
                            Duyệt
                        </Button>
                    );
                } else if (isPaused) {
                    actions.push(
                        <Button
                            key="resume"
                            size="small"
                            style={{ padding: '0 8px' }}
                            onClick={() => handleResume(record.id)}
                        >
                            Mở lại
                        </Button>
                    );
                } else {
                    actions.push(
                        <Button
                            key="pause"
                            danger
                            size="small"
                            style={{ padding: '0 8px' }}
                            onClick={() => handlePause(record.id)}
                        >
                            Tạm dừng
                        </Button>
                    );
                }

                actions.push(
                    <Button
                        key="deactivate"
                        danger
                        type="link"
                        size="small"
                        onClick={() => handleDeactivate(record.id)}
                    >
                        Xóa
                    </Button>
                );

                return (
                    <Space size={6} wrap>
                        {actions}
                    </Space>
                );
            },
        },
    ];

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
                <Tag 
                    color="blue" 
                    style={{ 
                        fontWeight: 'bold',
                        fontSize: '13px',
                        padding: '4px 12px',
                        borderRadius: '4px'
                    }}
                >
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
                    <Tag
                        style={{
                            backgroundColor: colorConfig.bg,
                            borderColor: colorConfig.border,
                            color: colorConfig.text,
                            borderRadius: 6,
                            padding: '2px 10px',
                            fontWeight: 600,
                        }}
                    >
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
            render: (time) => time ? dayjs(time).format('DD/MM/YYYY HH:mm:ss') : '-',
        },
    ];

    return (
        <div>
            <div style={{ 
                marginBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap'
                }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#262626' }}>
                        Quản lý Khuyến mãi
                    </h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={handleAddPromotion}
                        style={{
                            height: 44,
                            fontSize: '15px',
                            fontWeight: 600,
                            borderRadius: 10,
                            boxShadow: '0 6px 18px rgba(22,119,255,0.2)'
                        }}
                    >
                        Tạo khuyến mãi mới
                    </Button>
                </div>
                <Input.Search
                    placeholder="Tìm theo tên hoặc mã khuyến mãi"
                    allowClear
                    size="large"
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    value={searchKeyword}
                    style={{
                        width: '100%',
                        minWidth: 260,
                        height: 44,
                        borderRadius: 10,
                    }}
                    onSearch={(value) => setSearchKeyword(value)}
                />
            </div>
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    padding: '16px',
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'all',
                            label: `Tất cả (${filteredPromotions.length})`,
                        },
                        {
                            key: 'active',
                            label: `Đang hoạt động (${activePromotions.length})`,
                        },
                        {
                            key: 'pending',
                            label: `Chờ duyệt (${pendingPromotions.length})`,
                        },
                        {
                            key: 'approved',
                            label: `Đã duyệt (${approvedPromotions.length})`,
                        },
                        {
                            key: 'rejected',
                            label: `Đã từ chối (${rejectedPromotions.length})`,
                        },
                        {
                            key: 'paused',
                            label: `Đã xóa mềm (${pausedPromotions.length})`,
                        },
                        {
                            key: 'logs',
                            label: 'Nhật ký hoạt động',
                        },
                    ]}
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
                                pageSize: 10,
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
                    dataSource={displayedPromotions}
                    rowKey="id"
                    loading={loading}
                    bordered
                    size="small"
                    style={{ width: '100%' }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} khuyến mãi`,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                />
                )}
            </div>
            <PromotionModal
                open={promotionModalOpen}
                onCancel={handlePromotionModalCancel}
                onSuccess={handlePromotionModalSuccess}
                promotionId={editingPromotionId}
            />
        </div>
    );
};

export default AdminPromotionsPage;

