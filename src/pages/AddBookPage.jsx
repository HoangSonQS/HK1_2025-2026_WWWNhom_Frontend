import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Form, Input, InputNumber, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createBook } from '../features/book/api/bookService';
import { getAllCategories } from '../features/category/api/categoryService';
import Header from '../components/Header';
import '../styles/auth.css';

const { Content } = Layout;

const { TextArea } = Input;
const { Option } = Select;

const AddBookPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            message.error('Không thể tải danh sách thể loại');
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

            if (!imageFile) {
                message.error('Vui lòng chọn ảnh cho sách');
                setLoading(false);
                return;
            }

            await createBook(bookData, imageFile);
            message.success('Thêm sách thành công!');
            navigate('/books');
        } catch (error) {
            console.error('Error creating book:', error);
            const errorMsg = error.response?.data?.message || 'Thêm sách thất bại';
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
        return false; // Prevent auto upload
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header />
            <Content>
                <div className="login-page-container">
                    <div className="login-form-wrapper" style={{ maxWidth: '800px' }}>
                <div className="login-form-header">
                    <h1 className="login-title">THÊM SÁCH MỚI</h1>
                </div>

                <Form
                    form={form}
                    name="addBook"
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
                        rules={[{ required: true, message: 'Vui lòng chọn ảnh cho sách!' }]}
                    >
                        <Upload
                            beforeUpload={beforeUpload}
                            onChange={handleImageChange}
                            maxCount={1}
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />} size="large" block>
                                Chọn ảnh
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
                            {loading ? 'Đang thêm...' : 'THÊM SÁCH'}
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

export default AddBookPage;

