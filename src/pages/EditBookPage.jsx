import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Form, Input, InputNumber, Button, Upload, message, Select, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getBookById, updateBook } from '../features/book/api/bookService';
import { getAllCategories } from '../features/category/api/categoryService';
import { getImageUrl } from '../utils/imageUtils';
import Header from '../components/Header';
import '../styles/auth.css';

const { Content } = Layout;

const { Option } = Select;

const EditBookPage = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingBook, setLoadingBook] = useState(true);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    useEffect(() => {
        loadBook();
        loadCategories();
    }, [id]);

    const loadBook = async () => {
        setLoadingBook(true);
        try {
            const response = await getBookById(id);
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

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
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

            await updateBook(id, bookData, imageFile);
            message.success('Cập nhật sách thành công!');
            navigate('/books');
        } catch (error) {
            console.error('Error updating book:', error);
            const errorMsg = error.response?.data?.message || 'Cập nhật sách thất bại';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (info) => {
        if (info.file.status === 'done' || info.file.originFileObj) {
            setImageFile(info.file.originFileObj || info.file);
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

    if (loadingBook) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
                <Header />
                <Content>
                    <div className="login-page-container">
                        <Spin size="large" />
                    </div>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header />
            <Content>
                <div className="login-page-container">
                    <div className="login-form-wrapper" style={{ maxWidth: '800px' }}>
                <div className="login-form-header">
                    <h1 className="login-title">CẬP NHẬT SÁCH</h1>
                </div>

                <Form
                    form={form}
                    name="editBook"
                    className="login-form-modern"
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Tên sách"
                        rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
                    >
                        <Input size="large" className="login-input" placeholder="Tên sách" />
                    </Form.Item>

                    <Form.Item
                        name="author"
                        label="Tác giả"
                        rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
                    >
                        <Input size="large" className="login-input" placeholder="Tác giả" />
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
                            className="login-input"
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
                            className="login-input"
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
                            className="login-input"
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
                            <Button icon={<UploadOutlined />} size="large" block>
                                {imageFile ? 'Thay đổi ảnh' : 'Chọn ảnh mới (tùy chọn)'}
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-button"
                            size="large"
                            block
                            loading={loading}
                        >
                            {loading ? 'Đang cập nhật...' : 'CẬP NHẬT'}
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="default"
                            onClick={() => navigate('/books')}
                            className="reset-button"
                            size="large"
                            block
                        >
                            HỦY
                        </Button>
                    </Form.Item>
                </Form>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default EditBookPage;

