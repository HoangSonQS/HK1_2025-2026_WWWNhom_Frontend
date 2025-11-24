import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Form, Input, Button, message, Spin } from 'antd';
import { getCategoryById, updateCategory } from '../features/category/api/categoryService';
import Header from '../components/Header';
import '../styles/auth.css';

const { Content } = Layout;

const EditCategoryPage = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingCategory, setLoadingCategory] = useState(true);
    
    // Kiểm tra xem có đến từ admin dashboard không
    const fromAdmin = location.state?.fromAdmin || false;

    useEffect(() => {
        loadCategory();
    }, [id]);

    const loadCategory = async () => {
        setLoadingCategory(true);
        try {
            const response = await getCategoryById(id);
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

            await updateCategory(id, categoryData);
            message.success('Cập nhật thể loại thành công!');
            // Nếu đến từ admin, quay về trang admin/categories, ngược lại quay về trang công khai
            navigate(fromAdmin ? '/admin/categories' : '/categories');
        } catch (error) {
            console.error('Error updating category:', error);
            const errorMsg = error.response?.data?.message || 'Cập nhật thể loại thất bại';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loadingCategory) {
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
                    <div className="login-form-wrapper">
                <div className="login-form-header">
                    <h1 className="login-title">CẬP NHẬT THỂ LOẠI</h1>
                </div>

                <Form
                    form={form}
                    name="editCategory"
                    className="login-form-modern"
                    onFinish={handleSubmit}
                    layout="vertical"
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
                            className="login-input"
                            placeholder="Tên thể loại"
                        />
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
                            onClick={() => navigate(fromAdmin ? '/admin/categories' : '/categories')}
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

export default EditCategoryPage;

