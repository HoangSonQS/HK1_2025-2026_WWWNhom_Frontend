import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Spin } from 'antd';
import { getCategoryById, createCategory, updateCategory } from '../../../features/category/api/categoryService';

const CategoryModal = ({ open, onCancel, onSuccess, categoryId = null }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(false);

    const isEditMode = !!categoryId;

    useEffect(() => {
        if (open) {
            if (isEditMode) {
                loadCategory();
            } else {
                form.resetFields();
            }
        }
    }, [open, categoryId]);

    const loadCategory = async () => {
        setLoadingCategory(true);
        try {
            const response = await getCategoryById(categoryId);
            const category = response.data;
            
            form.setFieldsValue({
                name: category.name
            });
        } catch (error) {
            console.error('Error loading category:', error);
            message.error('Không thể tải thông tin thể loại');
        } finally {
            setLoadingCategory(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const categoryData = {
                name: values.name
            };

            let updatedCategory = null;
            if (isEditMode) {
                const response = await updateCategory(categoryId, categoryData);
                updatedCategory = response.data;
                message.success('Cập nhật thể loại thành công!');
            } else {
                const response = await createCategory(categoryData);
                updatedCategory = response.data;
                message.success('Thêm thể loại thành công!');
            }
            
            form.resetFields();
            onSuccess(updatedCategory);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, error);
            const errorMsg = error.response?.data?.message || `${isEditMode ? 'Cập nhật' : 'Thêm'} thể loại thất bại`;
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
            title={isEditMode ? 'Cập nhật thể loại' : 'Thêm thể loại mới'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            {loadingCategory ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Form
                    form={form}
                    name="categoryForm"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="name"
                        label="Tên thể loại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên thể loại!' },
                            { min: 2, message: 'Tên thể loại phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Tên thể loại"
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
                                {loading ? (isEditMode ? 'Đang cập nhật...' : 'Đang thêm...') : (isEditMode ? 'Cập nhật' : 'Thêm')}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default CategoryModal;

