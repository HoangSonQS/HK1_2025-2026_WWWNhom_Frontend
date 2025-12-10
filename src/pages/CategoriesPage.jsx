import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllCategories } from '../features/category/api/categoryService';
import { getAllCategories as getAllCategoriesStaff } from '../features/category/api/staffCategoryService';
import Header from '../components/Header';
import StaffHeader from '../components/StaffHeader';
import '../styles/books.css';

const { Content } = Layout;

const CategoriesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const isStaffRoute = location.pathname.startsWith('/staff');
    const CurrentHeader = isStaffRoute ? StaffHeader : Header;

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = isStaffRoute
                ? await getAllCategoriesStaff()
                : await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            if (error.response?.status === 401) {
                message.warning('Vui lòng đăng nhập để xem thể loại');
            } else {
                message.error('Không thể tải danh sách thể loại');
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên thể loại',
            dataIndex: 'name',
            key: 'name',
        },
    ];

    // Nếu từ staff route, không hiển thị Header (vì đã có StaffHeader trong StaffDashboard)
    const shouldShowHeader = !isStaffRoute;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {shouldShowHeader && <CurrentHeader />}
            <Content>
                <div className="books-page-container">
                    <div className="books-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 className="books-page-title">QUẢN LÝ THỂ LOẠI</h1>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            className="login-button"
                            onClick={() => navigate('/categories/add')}
                        >
                            Thêm thể loại mới
                        </Button>
                    </div>

                    <Card>
                        <Table
                            columns={columns}
                            dataSource={categories}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                defaultPageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} thể loại`,
                            }}
                        />
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default CategoriesPage;

