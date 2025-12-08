import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Upload, Select, Button, message, Spin, Space } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { createBook, getBookById, updateBook } from '../../../features/book/api/staffBookService';
import { getAllCategories, createCategory } from '../../../features/category/api/staffCategoryService';
import { getImageUrl } from '../../../utils/imageUtils';

const { Option } = Select;

const StaffBookModal = ({ open, onCancel, onSuccess, bookId = null }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingBook, setLoadingBook] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const isEditMode = !!bookId;

    useEffect(() => {
        if (open) {
            loadCategories();
            if (isEditMode) {
                loadBook();
            } else {
                form.resetFields();
                setImageFile(null);
                setCurrentImageUrl('');
            }
        }
    }, [open, bookId]);

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            message.error('Không thể tải danh sách thể loại');
        }
    };

    const loadBook = async () => {
        setLoadingBook(true);
        try {
            const response = await getBookById(bookId);
            const book = response.data;
            setCurrentImageUrl(book.imageUrl || '');
            
            form.setFieldsValue({
                title: book.title,
                author: book.author,
                price: book.price,
                quantity: book.quantity,
                categoryIds: book.categoryIds || []
            });
        } catch (error) {
            console.error('Error loading book:', error);
            message.error('Không thể tải thông tin sách');
        } finally {
            setLoadingBook(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName || !newCategoryName.trim()) {
            message.error('Vui lòng nhập tên thể loại!');
            return;
        }

        setCreatingCategory(true);
        try {
            const response = await createCategory({ name: newCategoryName.trim() });
            const newCategory = response.data;
            
            // Thêm category mới vào danh sách
            setCategories([...categories, newCategory]);
            
            // Tự động chọn category vừa tạo
            const currentCategoryIds = form.getFieldValue('categoryIds') || [];
            form.setFieldsValue({
                categoryIds: [...currentCategoryIds, newCategory.id]
            });
            
            message.success('Thêm thể loại mới thành công!');
            setCategoryModalVisible(false);
            setNewCategoryName('');
        } catch (error) {
            console.error('Error creating category:', error);
            const errorMsg = error.response?.data?.message || 'Thêm thể loại thất bại';
            message.error(errorMsg);
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const bookData = {
                title: values.title,
                author: values.author,
                price: values.price,
                quantity: values.quantity,
                categoryIds: values.categoryIds || []
            };

            let updatedBook = null;
            if (isEditMode) {
                const response = await updateBook(bookId, bookData, imageFile);
                updatedBook = response.data;
                message.success('Cập nhật sách thành công!');
            } else {
                if (!imageFile) {
                    message.error('Vui lòng chọn ảnh cho sách');
                    setLoading(false);
                    return;
                }
                const response = await createBook(bookData, imageFile);
                updatedBook = response.data;
                message.success('Thêm sách thành công!');
            }
            
            form.resetFields();
            setImageFile(null);
            setCurrentImageUrl('');
            onSuccess(updatedBook);
        } catch (error) {
            console.error('Error saving book:', error);
            const errorMsg = error.response?.data?.message || (isEditMode ? 'Cập nhật sách thất bại' : 'Thêm sách thất bại');
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (info) => {
        if (info.fileList.length > 0) {
            const file = info.file.originFileObj || info.file;
            if (file) {
                setImageFile(file);
            }
        } else {
            setImageFile(null);
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ có thể upload file ảnh!');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
            return Upload.LIST_IGNORE;
        }
        setImageFile(file);
        return false;
    };

    return (
        <>
            <Modal
                title={isEditMode ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
                open={open}
                onCancel={onCancel}
                footer={null}
                width={800}
            >
                <Spin spinning={loadingBook}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="title"
                            label="Tên sách"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
                        >
                            <Input placeholder="Tên sách" />
                        </Form.Item>

                        <Form.Item
                            name="author"
                            label="Tác giả"
                            rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
                        >
                            <Input placeholder="Tác giả" />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá"
                            rules={[
                                { required: true, message: 'Vui lòng nhập giá!' },
                                { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0!' }
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="Giá"
                            />
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label="Số lượng"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng!' },
                                { type: 'number', min: 0, message: 'Số lượng phải lớn hơn hoặc bằng 0!' }
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Số lượng"
                            />
                        </Form.Item>

                        <Form.Item
                            name="categoryIds"
                            label="Thể loại"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thể loại!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn thể loại"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                                            <Button
                                                type="link"
                                                icon={<PlusOutlined />}
                                                onClick={() => setCategoryModalVisible(true)}
                                                style={{ width: '100%' }}
                                            >
                                                Thêm thể loại mới
                                            </Button>
                                        </div>
                                    </>
                                )}
                            >
                                {categories.map(category => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="image"
                            label="Ảnh sách"
                            rules={isEditMode ? [] : [{ required: true, message: 'Vui lòng chọn ảnh cho sách!' }]}
                        >
                            {currentImageUrl && (
                                <div style={{ marginBottom: 16 }}>
                                    <img 
                                        src={getImageUrl(currentImageUrl)} 
                                        alt="Current" 
                                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-book.jpg';
                                        }}
                                    />
                                </div>
                            )}
                            <Upload
                                beforeUpload={beforeUpload}
                                onChange={handleImageChange}
                                maxCount={1}
                                listType="picture"
                            >
                                <Button icon={<UploadOutlined />}>
                                    {imageFile ? 'Thay đổi ảnh' : (isEditMode ? 'Chọn ảnh mới (tùy chọn)' : 'Chọn ảnh')}
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {isEditMode ? 'Cập nhật' : 'Thêm sách'}
                                </Button>
                                <Button onClick={onCancel}>Hủy</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            {/* Modal thêm thể loại mới */}
            <Modal
                title="Thêm thể loại mới"
                open={categoryModalVisible}
                onOk={handleCreateCategory}
                onCancel={() => {
                    setCategoryModalVisible(false);
                    setNewCategoryName('');
                }}
                okText="Thêm"
                cancelText="Hủy"
                confirmLoading={creatingCategory}
            >
                <Form.Item
                    label="Tên thể loại"
                    rules={[{ required: true, message: 'Vui lòng nhập tên thể loại!' }]}
                >
                    <Input
                        placeholder="Nhập tên thể loại"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onPressEnter={handleCreateCategory}
                        autoFocus
                    />
                </Form.Item>
            </Modal>
        </>
    );
};

export default StaffBookModal;

