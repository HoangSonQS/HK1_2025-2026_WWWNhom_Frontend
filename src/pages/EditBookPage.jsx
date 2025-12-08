import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Form, Input, InputNumber, Button, Upload, message, Select, Spin, Modal } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { getBookById, updateBook } from '../features/book/api/bookService';
import { getBookById as getBookByIdStaff, updateBook as updateBookStaff } from '../features/book/api/staffBookService';
import { getAllCategories, createCategory } from '../features/category/api/categoryService';
import { getAllCategories as getAllCategoriesStaff, createCategory as createCategoryStaff } from '../features/category/api/staffCategoryService';
import { getImageUrl } from '../utils/imageUtils';
import Header from '../components/Header';
import '../styles/auth.css';

const { Content } = Layout;

const { Option } = Select;

const EditBookPage = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingBook, setLoadingBook] = useState(true);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    
    // Kiểm tra xem có đến từ admin dashboard không
    const fromAdmin = location.state?.fromAdmin || false;
    // Kiểm tra xem có đến từ staff route không
    const isStaffRoute = location.pathname.startsWith('/staff');

    useEffect(() => {
        loadBook();
        loadCategories();
    }, [id]);

    const loadBook = async () => {
        setLoadingBook(true);
        try {
            // Nếu từ staff route, dùng staffBookService, ngược lại dùng bookService
            const response = isStaffRoute
                ? await getBookByIdStaff(id)
                : await getBookById(id);
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
            // Nếu từ staff route, dùng staffCategoryService, ngược lại dùng categoryService
            const response = isStaffRoute 
                ? await getAllCategoriesStaff() 
                : await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
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

            // Nếu từ staff route, dùng staffBookService, ngược lại dùng bookService
            if (isStaffRoute) {
                await updateBookStaff(id, bookData, imageFile);
            } else {
                await updateBook(id, bookData, imageFile);
            }
            message.success('Cập nhật sách thành công!');
            // Điều hướng dựa trên route
            if (isStaffRoute) {
                navigate('/staff/books');
            } else if (fromAdmin) {
                navigate('/admin/books');
            } else {
                navigate('/books');
            }
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

    // Nếu từ staff route, không hiển thị Header (vì đã có StaffHeader trong StaffDashboard)
    const shouldShowHeader = !isStaffRoute;

    if (loadingBook) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
                {shouldShowHeader && <Header />}
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
            {shouldShowHeader && <Header />}
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

export default EditBookPage;

