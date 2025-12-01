import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Upload, Select, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createBook, getBookById, updateBook } from '../../../features/book/api/bookService';
import { getAllCategories } from '../../../features/category/api/categoryService';
import { getImageUrl } from '../../../utils/imageUtils';

const { Option } = Select;

const BookModal = ({ open, onCancel, onSuccess, bookId = null }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingBook, setLoadingBook] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

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
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} book:`, error);
            const errorMsg = error.response?.data?.message || `${isEditMode ? 'Cập nhật' : 'Thêm'} sách thất bại`;
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (info) => {
        // Khi beforeUpload return false, file vẫn được thêm vào fileList
        // và onChange sẽ được gọi với file object
        if (info.fileList.length > 0) {
            const file = info.file.originFileObj || info.file;
            if (file) {
                setImageFile(file);
                // Set giá trị vào form để validation hoạt động đúng
                form.setFieldsValue({ image: file });
                form.validateFields(['image']);
            }
        } else {
            // Khi xóa file
            setImageFile(null);
            form.setFieldsValue({ image: null });
            form.validateFields(['image']);
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
        // Set giá trị vào form để validation hoạt động đúng
        form.setFieldsValue({ image: file });
        form.validateFields(['image']);
        return false;
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        form.setFieldsValue({ image: null });
        form.validateFields(['image']);
    };

    const handleCancel = () => {
        form.resetFields();
        setImageFile(null);
        setCurrentImageUrl('');
        onCancel();
    };

    return (
        <Modal
            title={isEditMode ? 'Cập nhật sách' : 'Thêm sách mới'}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            {loadingBook ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Form
                    form={form}
                    name="bookForm"
                    onFinish={handleSubmit}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="title"
                        label="Tên sách"
                        rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
                    >
                        <Input size="large" placeholder="Tên sách" />
                    </Form.Item>

                    <Form.Item
                        name="author"
                        label="Tác giả"
                        rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
                    >
                        <Input size="large" placeholder="Tác giả" />
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
                            size="large"
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
                            size="large"
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
                            size="large"
                            placeholder="Chọn thể loại"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
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
                        rules={!isEditMode ? [{ required: true, message: 'Vui lòng chọn ảnh cho sách!' }] : []}
                    >
                        {currentImageUrl && (
                            <div style={{ marginBottom: 16 }}>
                                <img 
                                    src={getImageUrl(currentImageUrl)} 
                                    alt="Current" 
                                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = '/placeholder-book.jpg';
                                    }}
                                />
                            </div>
                        )}
                        <Upload
                            beforeUpload={beforeUpload}
                            onChange={handleImageChange}
                            onRemove={handleRemoveImage}
                            maxCount={1}
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />} size="large" block>
                                {imageFile ? 'Thay đổi ảnh' : (isEditMode ? 'Chọn ảnh mới (tùy chọn)' : 'Chọn ảnh')}
                            </Button>
                        </Upload>
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

export default BookModal;

