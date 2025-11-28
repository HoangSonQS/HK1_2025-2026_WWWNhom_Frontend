import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, message, Tag, Tabs, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { 
    getAllPromotions
} from '../../features/promotion/api/promotionService';
import PromotionModal from './components/PromotionModal';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const AdminPromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promotionModalOpen, setPromotionModalOpen] = useState(false);
    const [editingPromotionId, setEditingPromotionId] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
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

    const rejectedPromotions = useMemo(
        () => filteredPromotions.filter(promo => promo.status === 'REJECTED'),
        [filteredPromotions]
    );

    const pausedPromotions = useMemo(
        () => filteredPromotions.filter(promo => promo.status === 'PAUSED'),
        [filteredPromotions]
    );

    const displayedPromotions = useMemo(() => {
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
    }, [filteredPromotions, pendingPromotions, approvedPromotions, rejectedPromotions, pausedPromotions, activeTab]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            fixed: 'left',
        },
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
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
            title: 'Giảm giá',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            width: 120,
            render: (percent) => (
                <span style={{ 
                    color: '#f5222d',
                    fontWeight: 600,
                    fontSize: '14px'
                }}>
                    {percent}%
                </span>
            ),
            sorter: (a, b) => a.discountPercent - b.discountPercent,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 150,
            render: (date) => formatDate(date),
            sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            width: 150,
            render: (date) => formatDate(date),
            sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: 'Giá trị áp dụng',
            dataIndex: 'priceOrderActive',
            key: 'priceOrderActive',
            width: 180,
            render: (price) => (
                <span style={{ 
                    color: price ? '#1890ff' : '#8c8c8c',
                    fontWeight: price ? '500' : 'normal'
                }}>
                    {formatPrice(price)}
                </span>
            ),
            sorter: (a, b) => {
                const priceA = a.priceOrderActive || 0;
                const priceB = b.priceOrderActive || 0;
                return priceA - priceB;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 160,
            render: (_, record) => {
                const expired = isExpired(record.endDate);
                switch (record.status) {
                    case 'PENDING':
                        return <Tag color="gold" style={{ borderRadius: '4px', padding: '2px 8px' }}>Chờ duyệt</Tag>;
                    case 'ACTIVE':
                        if (expired) {
                            return <Tag color="orange" style={{ borderRadius: '4px', padding: '2px 8px' }}>Đã hết hạn</Tag>;
                        }
                        return <Tag color="green" style={{ borderRadius: '4px', padding: '2px 8px' }}>Đang hoạt động</Tag>;
                    case 'REJECTED':
                        return <Tag color="red" style={{ borderRadius: '4px', padding: '2px 8px' }}>Đã từ chối</Tag>;
                    case 'PAUSED':
                        return <Tag color="blue" style={{ borderRadius: '4px', padding: '2px 8px' }}>Đã xóa mềm</Tag>;
                    default:
                        return <Tag color="#d9d9d9" style={{ borderRadius: '4px', padding: '2px 8px' }}>Không xác định</Tag>;
                }
            },
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdByName',
            key: 'createdByName',
            width: 120,
            render: (name) => name || '-',
        },
        {
            title: 'Người duyệt',
            dataIndex: 'approvedByName',
            key: 'approvedByName',
            width: 120,
            render: (name) => name || '-',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => navigate(`/admin/promotions/${record.id}`)}
                        style={{
                            backgroundColor: '#1677ff',
                            borderColor: '#1677ff',
                            borderRadius: '4px',
                            fontWeight: 500,
                        }}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24,
                gap: 16,
                flexWrap: 'wrap'
            }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#262626' }}>Quản lý Khuyến mãi</h1>
                <Space size={16} wrap>
                    <Input.Search
                        placeholder="Tìm theo tên hoặc mã khuyến mãi"
                        allowClear
                        size="large"
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        value={searchKeyword}
                        style={{
                            minWidth: 320,
                            height: 40,
                            borderRadius: 8,
                        }}
                        onSearch={(value) => setSearchKeyword(value)}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={handleAddPromotion}
                        style={{
                            height: '40px',
                            fontSize: '15px',
                            fontWeight: 500,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Tạo khuyến mãi mới
                    </Button>
                </Space>
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
                    ]}
                />
                <div style={{ overflowX: 'auto' }}>
                    <Table
                        columns={columns}
                        dataSource={displayedPromotions}
                        rowKey="id"
                        loading={loading}
                        bordered
                        scroll={{ x: 1540 }}
                        style={{
                            minWidth: '100%',
                        }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} khuyến mãi`,
                            showQuickJumper: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                    />
                </div>
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

