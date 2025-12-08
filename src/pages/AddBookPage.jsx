import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Form, Input, InputNumber, Button, Upload, message, Select, Modal } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { createBook } from '../features/book/api/bookService';
import { createBook as createBookStaff } from '../features/book/api/staffBookService';
import { getAllCategories, createCategory } from '../features/category/api/categoryService';
import { getAllCategories as getAllCategoriesStaff, createCategory as createCategoryStaff } from '../features/category/api/staffCategoryService';
import Header from '../components/Header';
import '../styles/auth.css';

const { Content } = Layout;

const { TextArea } = Input;
const { Option } = Select;

const AddBookPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    
    // Kiểm tra xem có đến từ admin dashboard không
    const fromAdmin = location.state?.fromAdmin || false;
    // Kiểm tra xem có đến từ staff route không
    const isStaffRoute = location.pathname.startsWith('/staff');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            // Nếu từ staff route, dùng staffCategoryService, ngược lại dùng categoryService
            const response = isStaffRoute 
                ? await getAllCategoriesStaff() 
                : await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            message.error('Không thể tải danh sách thể loại');
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName || !newCategoryName.trim()) {
            message.error('Vui lòng nhập tên thể loại!');
            return;
        }

        setCreatingCategory(true);
        try {
            // Nếu từ staff route, dùng staffCategoryService, ngược lại dùng categoryService
            const response = isStaffRoute
                ? await createCategoryStaff({ name: newCategoryName.trim() })
                : await createCategory({ name: newCategoryName.trim() });
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

            if (!imageFile) {
                message.error('Vui lòng chọn ảnh cho sách');
                setLoading(false);
                return;
            }

            // Nếu từ staff route, dùng staffBookService, ngược lại dùng bookService
            if (isStaffRoute) {
                await createBookStaff(bookData, imageFile);
            } else {
                await createBook(bookData, imageFile);
            }
            message.success('Thêm sách thành công!');
            // Điều hướng dựa trên route
            if (isStaffRoute) {
                navigate('/staff/books');
            } else if (fromAdmin) {
                navigate('/admin/books');
            } else {
                navigate('/books');
            }
        } catch (error) {
            console.error('Error creating book:', error);
            const errorMsg = error.response?.data?.message || 'Thêm sách thất bại';
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

    const handleRemoveImage = () => {
        setImageFile(null);
        form.setFieldsValue({ image: null });
        form.validateFields(['image']);
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
        return false; // Prevent auto upload
    };

    // Nếu từ staff route, không hiển thị Header (vì đã có StaffHeader trong StaffDashboard)
    const shouldShowHeader = !isStaffRoute;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {shouldShowHeader && <Header />}
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
                        rules={[{ required: true, message: 'Vui lòng chọn ảnh cho sách!' }]}
                    >
                        <Upload
                            beforeUpload={beforeUpload}
                            onChange={handleImageChange}
                            onRemove={handleRemoveImage}
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
                            onClick={() => navigate(fromAdmin ? '/admin/books' : '/books')}
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
        </Layout>
    );
};

export default AddBookPage;

