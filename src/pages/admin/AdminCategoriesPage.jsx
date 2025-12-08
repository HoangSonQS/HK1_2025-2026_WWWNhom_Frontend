import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllCategories, deleteCategory } from '../../features/category/api/categoryService';
import CategoryModal from './components/CategoryModal';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await getAllCategories();
            const categoriesData = response.data || [];
            
            // Sắp xếp theo ID tăng dần
            const sortedCategories = [...categoriesData].sort((a, b) => {
                const idA = a.id || 0;
                const idB = b.id || 0;
                return idA - idB;
            });
            
            setCategories(sortedCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
            message.error('Không thể tải danh sách thể loại');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            message.success('Xóa thể loại thành công');
            
            // Xóa thể loại khỏi state và giữ nguyên thứ tự
            setCategories(prevCategories => {
                const updated = prevCategories.filter(category => category.id !== id);
                // Đảm bảo vẫn sắp xếp theo ID tăng dần
                return updated.sort((a, b) => {
                    const idA = a.id || 0;
                    const idB = b.id || 0;
                    return idA - idB;
                });
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            const errorMsg = error.response?.data?.message || 'Xóa thể loại thất bại';
            message.error(errorMsg);
        }
    };

    const handleAddCategory = () => {
        setEditingCategoryId(null);
        setCategoryModalOpen(true);
    };

    const handleEditCategory = (id) => {
        setEditingCategoryId(id);
        setCategoryModalOpen(true);
    };

    const handleCategoryModalSuccess = (updatedCategory) => {
        const currentEditingId = editingCategoryId; // Lưu giá trị trước khi reset
        setCategoryModalOpen(false);
        setEditingCategoryId(null);
        
        if (updatedCategory) {
            if (currentEditingId) {
                // Cập nhật thể loại đã có
                setCategories(prevCategories => {
                    const updated = prevCategories.map(category => 
                        category.id === currentEditingId 
                            ? { ...category, ...updatedCategory }
                            : category
                    );
                    // Đảm bảo vẫn sắp xếp theo ID tăng dần
                    return updated.sort((a, b) => {
                        const idA = a.id || 0;
                        const idB = b.id || 0;
                        return idA - idB;
                    });
                });
            } else {
                // Thêm thể loại mới
                setCategories(prevCategories => {
                    const updated = [...prevCategories, updatedCategory];
                    // Sắp xếp theo ID tăng dần
                    return updated.sort((a, b) => {
                        const idA = a.id || 0;
                        const idB = b.id || 0;
                        return idA - idB;
                    });
                });
            }
        } else {
            // Fallback: reload nếu không có dữ liệu
            loadCategories();
        }
    };

    const handleCategoryModalCancel = () => {
        setCategoryModalOpen(false);
        setEditingCategoryId(null);
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
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(record.id)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa thể loại này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24 
            }}>
                <h1 style={{ margin: 0 }}>Quản lý Thể loại</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAddCategory}
                >
                    Thêm thể loại mới
                </Button>
            </div>
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
            <CategoryModal
                open={categoryModalOpen}
                onCancel={handleCategoryModalCancel}
                onSuccess={handleCategoryModalSuccess}
                categoryId={editingCategoryId}
            />
        </div>
    );
};

export default AdminCategoriesPage;

