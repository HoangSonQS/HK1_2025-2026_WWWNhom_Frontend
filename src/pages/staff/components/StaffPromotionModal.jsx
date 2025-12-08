import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Spin, DatePicker, Space } from 'antd';
import { getPromotionById, createPromotion } from '../../../features/promotion/api/staffPromotionService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const StaffPromotionModal = ({ open, onCancel, onSuccess, promotionId = null }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingPromotion, setLoadingPromotion] = useState(false);

    const isEditMode = !!promotionId;

    useEffect(() => {
        if (open) {
            if (isEditMode) {
                loadPromotion();
            } else {
                form.resetFields();
            }
        }
    }, [open, promotionId]);

    const loadPromotion = async () => {
        setLoadingPromotion(true);
        try {
            const response = await getPromotionById(promotionId);
            const promotion = response.data;
            
            form.setFieldsValue({
                name: promotion.name,
                code: promotion.code,
                discountPercent: promotion.discountPercent,
                quantity: promotion.quantity,
                priceOrderActive: promotion.priceOrderActive,
                dateRange: [
                    dayjs(promotion.startDate),
                    dayjs(promotion.endDate)
                ]
            });
        } catch (error) {
            console.error('Error loading promotion:', error);
            message.error('Không thể tải thông tin khuyến mãi');
        } finally {
            setLoadingPromotion(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const promotionData = {
                name: values.name,
                code: values.code,
                discountPercent: values.discountPercent,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                quantity: values.quantity,
                priceOrderActive: values.priceOrderActive || null
            };

            let updatedPromotion = null;
            if (isEditMode) {
                // Backend chưa có update endpoint, có thể cần thêm sau
                message.warning('Chức năng cập nhật khuyến mãi chưa được hỗ trợ. Vui lòng tạo mới hoặc xóa và tạo lại.');
                setLoading(false);
                return;
            } else {
                const response = await createPromotion(promotionData);
                updatedPromotion = response.data;
                message.success('Tạo khuyến mãi thành công!');
            }
            
            form.resetFields();
            onSuccess(updatedPromotion);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} promotion:`, error);
            const errorMsg = error.response?.data?.message || `${isEditMode ? 'Cập nhật' : 'Tạo'} khuyến mãi thất bại`;
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={isEditMode ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi mới'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={700}
            destroyOnClose
        >
            <Spin spinning={loadingPromotion}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng nhập tên khuyến mãi!' }]}
                    >
                        <Input placeholder="Tên khuyến mãi" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã khuyến mãi"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã khuyến mãi!' },
                            { pattern: /^[A-Z0-9]+$/, message: 'Mã khuyến mãi chỉ được chứa chữ in hoa và số!' }
                        ]}
                    >
                        <Input placeholder="Mã khuyến mãi (VD: SALE2024)" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item
                        name="discountPercent"
                        label="Phần trăm giảm giá"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phần trăm giảm giá!' },
                            { type: 'number', min: 1, max: 100, message: 'Phần trăm giảm giá phải từ 1 đến 100!' }
                        ]}
                    >
                        <Space.Compact style={{ width: '100%' }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Phần trăm giảm giá (1-100)"
                                min={1}
                                max={100}
                            />
                            <Input
                                style={{ width: 50, textAlign: 'center', pointerEvents: 'none', backgroundColor: '#f5f5f5' }}
                                value="%"
                                readOnly
                            />
                        </Space.Compact>
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượng!' },
                            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Số lượng khuyến mãi"
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="priceOrderActive"
                        label="Đơn hàng tối thiểu (VND)"
                        rules={[
                            { type: 'number', min: 0, message: 'Đơn hàng tối thiểu phải lớn hơn hoặc bằng 0!' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Đơn hàng tối thiểu (để trống nếu không giới hạn)"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng!' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEditMode ? 'Cập nhật' : 'Tạo khuyến mãi'}
                            </Button>
                            <Button onClick={handleCancel}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default StaffPromotionModal;

