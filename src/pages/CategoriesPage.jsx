import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../features/category/api/categoryService';
import Header from '../components/Header';
import '../styles/books.css';

const { Content } = Layout;

const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            message.error('Không thể tải danh sách thể loại');
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

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header />
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
                                pageSize: 10,
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

