import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Space, message, Tag, Tabs, Input, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { 
    getAllPromotions,
    getPromotionLogsByDateRange
} from '../../features/promotion/api/staffPromotionService';
import StaffPromotionModal from './components/StaffPromotionModal';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    useEffect(() => {
        loadPromotions();
    }, []);

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
        {
            key: 'all',
            label: 'Tất cả',
        },
        {
            key: 'active',
            label: 'Đang hoạt động',
        },
        {
            key: 'pending',
            label: 'Chờ duyệt',
        },
        {
            key: 'expired',
            label: 'Hết hạn',
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

            <Table
                columns={columns}
                dataSource={filteredPromotions}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} khuyến mãi`,
                }}
            />

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

