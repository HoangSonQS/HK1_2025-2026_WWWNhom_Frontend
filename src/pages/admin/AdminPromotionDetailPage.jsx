import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Space, Spin, Tag, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, GiftOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPromotionById as getPromotionByIdStaff, approvePromotion as approvePromotionStaff, deactivatePromotion as deactivatePromotionStaff, pausePromotion as pausePromotionStaff, resumePromotion as resumePromotionStaff } from '../../features/promotion/api/staffPromotionService';
import { adminPromotionService } from '../../features/promotion/api/adminPromotionService';

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
    const location = useLocation();
    const isStaffRoute = location.pathname.startsWith('/staff');
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadPromotion();
    }, [id]);

    const loadPromotion = async () => {
        setLoading(true);
        try {
            if (isStaffRoute) {
                const response = await getPromotionByIdStaff(id);
                setPromotion(response.data || response);
            } else {
                const data = await adminPromotionService.getById(id);
                setPromotion(data);
            }
        } catch (error) {
            console.error('Error loading promotion detail:', error);
            message.error('Không thể tải thông tin khuyến mãi');
            navigate(isStaffRoute ? '/staff/promotions' : '/admin/promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            if (isStaffRoute) {
                await approvePromotionStaff(id);
            } else {
                await adminPromotionService.approve(id);
            }
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
            if (isStaffRoute) {
                await deactivatePromotionStaff(id);
            } else {
                await adminPromotionService.deactivate(id);
            }
            message.success('Đã từ chối khuyến mãi');
            await loadPromotion();
        } catch (error) {
            console.error('Error rejecting promotion:', error);
            message.error(error.response?.data?.message || 'Không thể từ chối khuyến mãi');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSoftDelete = async () => {
        setActionLoading(true);
        try {
            if (isStaffRoute) {
                await pausePromotionStaff(id);
            } else {
                await adminPromotionService.pause(id);
            }
            message.success('Đã xóa mềm khuyến mãi và thông báo đến người dùng');
            await loadPromotion();
        } catch (error) {
            console.error('Error soft deleting promotion:', error);
            message.error(error.response?.data?.message || 'Không thể xóa mềm khuyến mãi');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResume = async () => {
        setActionLoading(true);
        try {
            if (isStaffRoute) {
                await resumePromotionStaff(id);
            } else {
                await adminPromotionService.resume(id);
            }
            message.success('Khuyến mãi đã được kích hoạt lại');
            await loadPromotion();
        } catch (error) {
            console.error('Error resuming promotion:', error);
            message.error(error.response?.data?.message || 'Không thể kích hoạt lại khuyến mãi');
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

    const handleViewActivity = () => {
        const basePath = isStaffRoute ? '/staff/promotions' : '/admin/promotions';
        navigate(`${basePath}?tab=logs&promotionId=${id}`);
    };

    return (
        <div>
            <Space style={{ marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Button 
                    icon={<HistoryOutlined />} 
                    onClick={handleViewActivity}
                    type="default"
                >
                    Xem hoạt động
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
                        {promotion.status === 'PENDING' && (
                            <Tag color="gold" style={{ padding: '4px 12px' }}>
                                Chờ duyệt
                            </Tag>
                        )}
                        {promotion.status === 'ACTIVE' && (
                            <Tag color="green" style={{ padding: '4px 12px' }}>
                                Đang hoạt động
                            </Tag>
                        )}
                        {promotion.status === 'PAUSED' && (
                            <Tag color="blue" style={{ padding: '4px 12px' }}>
                                Đã xóa mềm
                            </Tag>
                        )}
                        {promotion.status === 'REJECTED' && (
                            <Tag color="red" style={{ padding: '4px 12px' }}>
                                Đã từ chối
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
                {promotion.status === 'PENDING' && (
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
                {promotion.status === 'ACTIVE' && (
                    <Space style={{ marginTop: 24 }}>
                        <Popconfirm
                            title="Xóa mềm khuyến mãi"
                            description="Khuyến mãi sẽ tạm dừng và người dùng sẽ nhận được thông báo. Bạn chắc chứ?"
                            okText="Xóa mềm"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            onConfirm={handleSoftDelete}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={actionLoading}
                            >
                                Xóa mềm
                            </Button>
                        </Popconfirm>
                    </Space>
                )}
                {promotion.status === 'PAUSED' && (
                    <Space style={{ marginTop: 24 }}>
                        <Popconfirm
                            title="Kích hoạt lại khuyến mãi"
                            description="Khuyến mãi sẽ hoạt động trở lại và gửi thông báo đến người dùng. Tiếp tục?"
                            okText="Kích hoạt lại"
                            cancelText="Hủy"
                            onConfirm={handleResume}
                        >
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={actionLoading}
                            >
                                Kích hoạt lại
                            </Button>
                        </Popconfirm>
                    </Space>
                )}
            </Card>
        </div>
    );
};

export default AdminPromotionDetailPage;


