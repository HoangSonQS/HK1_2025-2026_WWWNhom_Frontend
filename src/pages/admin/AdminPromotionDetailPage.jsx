import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Space, Spin, Tag, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, GiftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPromotionById, approvePromotion, deactivatePromotion } from '../../features/promotion/api/promotionService';

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'Không giới hạn';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const formatDate = (date) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY');
};

const AdminPromotionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadPromotion();
    }, [id]);

    const loadPromotion = async () => {
        setLoading(true);
        try {
            const response = await getPromotionById(id);
            setPromotion(response.data);
        } catch (error) {
            console.error('Error loading promotion detail:', error);
            message.error('Không thể tải thông tin khuyến mãi');
            navigate('/admin/promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approvePromotion(id);
            message.success('Duyệt khuyến mãi thành công');
            await loadPromotion();
        } catch (error) {
            console.error('Error approving promotion:', error);
            message.error(error.response?.data?.message || 'Không thể duyệt khuyến mãi');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        try {
            await deactivatePromotion(id);
            message.success('Đã từ chối khuyến mãi');
            await loadPromotion();
        } catch (error) {
            console.error('Error rejecting promotion:', error);
            message.error(error.response?.data?.message || 'Không thể từ chối khuyến mãi');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
        );
    }

    if (!promotion) {
        return null;
    }

    return (
        <div>
            <Space style={{ marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
            </Space>

            <Card
                title={
                    <Space size="large">
                        <Space>
                            <GiftOutlined style={{ color: '#ff6b35', fontSize: 20 }} />
                            <span style={{ fontSize: 18, fontWeight: 600 }}>
                                Khuyến mãi #{promotion.id}
                            </span>
                        </Space>
                        {promotion.approvedByName ? (
                            <Tag color={promotion.isActive ? 'green' : 'red'} style={{ padding: '4px 12px' }}>
                                {promotion.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                            </Tag>
                        ) : (
                            <Tag color="gold" style={{ padding: '4px 12px' }}>
                                Chờ duyệt
                            </Tag>
                        )}
                    </Space>
                }
            >
                <Descriptions
                    bordered
                    column={2}
                    size="middle"
                    labelStyle={{ fontWeight: 600, width: '25%' }}
                >
                    <Descriptions.Item label="Tên khuyến mãi" span={2}>
                        {promotion.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã khuyến mãi">
                        <Tag color="blue" style={{ padding: '4px 12px', fontWeight: 600 }}>
                            {promotion.code}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phần trăm giảm giá">
                        <Tag color="red" style={{ padding: '4px 12px', fontWeight: 600 }}>
                            {promotion.discountPercent}%
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá trị áp dụng tối thiểu">
                        {formatCurrency(promotion.priceOrderActive)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng mã">
                        {promotion.quantity}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                        {formatDate(promotion.startDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">
                        {formatDate(promotion.endDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">
                        {promotion.createdByName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người duyệt">
                        {promotion.approvedByName || 'Chưa duyệt'}
                    </Descriptions.Item>
                </Descriptions>
                {!promotion.approvedByName && (
                    <Space style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={handleApprove}
                            loading={actionLoading}
                        >
                            Duyệt khuyến mãi
                        </Button>
                        <Popconfirm
                            title="Từ chối khuyến mãi"
                            description="Bạn có chắc chắn muốn từ chối khuyến mãi này?"
                            okText="Từ chối"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            onConfirm={handleReject}
                        >
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                loading={actionLoading}
                            >
                                Từ chối
                            </Button>
                        </Popconfirm>
                    </Space>
                )}
            </Card>
        </div>
    );
};

export default AdminPromotionDetailPage;


