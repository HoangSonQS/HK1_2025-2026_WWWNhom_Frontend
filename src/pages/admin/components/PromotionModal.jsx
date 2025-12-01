import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Spin, DatePicker } from 'antd';
import { getPromotionById, createPromotion } from '../../../features/promotion/api/promotionService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const PromotionModal = ({ open, onCancel, onSuccess, promotionId = null }) => {
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
            {loadingPromotion ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Form
                    form={form}
                    name="promotionForm"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        label="Tên khuyến mãi"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên khuyến mãi!' },
                            { min: 2, message: 'Tên khuyến mãi phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input size="large" placeholder="Tên khuyến mãi" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã khuyến mãi"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã khuyến mãi!' },
                            { pattern: /^[A-Z0-9]+$/, message: 'Mã khuyến mãi chỉ được chứa chữ in hoa và số!' }
                        ]}
                    >
                        <Input 
                            size="large" 
                            placeholder="Mã khuyến mãi (VD: SALE10)" 
                            style={{ textTransform: 'uppercase' }}
                            onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="discountPercent"
                        label="Phần trăm giảm giá (%)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phần trăm giảm giá!' },
                            { type: 'number', min: 0, max: 100, message: 'Phần trăm giảm giá phải từ 0 đến 100!' }
                        ]}
                    >
                        <InputNumber
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="Phần trăm giảm giá"
                            min={0}
                            max={100}
                            formatter={value => `${value}%`}
                            parser={value => value.replace('%', '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian áp dụng!' }
                        ]}
                    >
                        <RangePicker
                            size="large"
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            disabledDate={(current) => {
                                // Không cho chọn ngày trong quá khứ
                                return current && current < dayjs().startOf('day');
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng mã"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượng mã!' },
                            { type: 'number', min: 1, message: 'Số lượng mã phải lớn hơn 0!' }
                        ]}
                    >
                        <InputNumber
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="Số lượng mã khuyến mãi"
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="priceOrderActive"
                        label="Giá trị đơn hàng tối thiểu (VND)"
                        tooltip="Đơn hàng phải có giá trị tối thiểu này mới được áp dụng mã khuyến mãi. Để trống nếu không giới hạn."
                        rules={[
                            { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0!' }
                        ]}
                    >
                        <InputNumber
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="Giá trị đơn hàng tối thiểu (VD: 100000)"
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancel} size="large">
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                            >
                                {loading ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...') : (isEditMode ? 'Cập nhật' : 'Tạo')}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default PromotionModal;

