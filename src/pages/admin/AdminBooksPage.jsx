import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Image, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllBooks, deleteBook } from '../../features/book/api/adminBookService';
import { getImageUrl } from '../../utils/imageUtils';
import BookModal from './components/BookModal';

const AdminBooksPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookModalOpen, setBookModalOpen] = useState(false);
    const [editingBookId, setEditingBookId] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        loadBooks();
    }, [showInactive]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await getAllBooks(showInactive);
            const booksData = response.data || [];
            
            // Sắp xếp theo ID tăng dần
            const sortedBooks = [...booksData].sort((a, b) => {
                const idA = a.id || 0;
                const idB = b.id || 0;
                return idA - idB;
            });
            
            setBooks(sortedBooks);
        } catch (error) {
            console.error('Error loading books:', error);
            message.error('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteBook(id);
            message.success('Xóa sách thành công');
            
            // Xóa sách khỏi state và giữ nguyên thứ tự
            setBooks(prevBooks => {
                const updated = prevBooks.filter(book => book.id !== id);
                // Đảm bảo vẫn sắp xếp theo ID tăng dần
                return updated.sort((a, b) => {
                    const idA = a.id || 0;
                    const idB = b.id || 0;
                    return idA - idB;
                });
            });
        } catch (error) {
            console.error('Error deleting book:', error);
            message.error('Xóa sách thất bại');
        }
    };

    const handleAddBook = () => {
        setEditingBookId(null);
        setBookModalOpen(true);
    };

    const handleEditBook = (id) => {
        setEditingBookId(id);
        setBookModalOpen(true);
    };

    const handleBookModalSuccess = (updatedBook) => {
        const currentEditingId = editingBookId; // Lưu giá trị trước khi reset
        setBookModalOpen(false);
        setEditingBookId(null);
        
        if (updatedBook) {
            if (currentEditingId) {
                // Cập nhật sách đã có
                setBooks(prevBooks => {
                    const updated = prevBooks.map(book => 
                        book.id === currentEditingId 
                            ? { ...book, ...updatedBook }
                            : book
                    );
                    // Đảm bảo vẫn sắp xếp theo ID tăng dần
                    return updated.sort((a, b) => {
                        const idA = a.id || 0;
                        const idB = b.id || 0;
                        return idA - idB;
                    });
                });
            } else {
                // Thêm sách mới
                setBooks(prevBooks => {
                    const updated = [...prevBooks, updatedBook];
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
            loadBooks();
        }
    };

    const handleBookModalCancel = () => {
        setBookModalOpen(false);
        setEditingBookId(null);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 100,
            render: (imageUrl) => (
                <Image
                    src={getImageUrl(imageUrl)}
                    alt="Book"
                    width={60}
                    height={80}
                    style={{ objectFit: 'cover' }}
                    fallback="/placeholder-book.jpg"
                />
            ),
        },
        {
            title: 'Tên sách',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => formatPrice(price),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: 'Thể loại',
            dataIndex: 'categoryNames',
            key: 'categoryNames',
            render: (categoryNames) => {
                if (!categoryNames || categoryNames.length === 0) return '-';
                return Array.isArray(categoryNames) 
                    ? categoryNames.join(', ') 
                    : categoryNames;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditBook(record.id)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sách này?"
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
                <h1 style={{ margin: 0 }}>Quản lý Sách</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAddBook}
                >
                    Thêm sách mới
                </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Space>
                    <span>Hiển thị sách đã ẩn</span>
                    <Switch checked={showInactive} onChange={setShowInactive} />
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={books}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50, 100],
                    showTotal: (total) => `Tổng ${total} sách`,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                }}
            />
            <BookModal
                open={bookModalOpen}
                onCancel={handleBookModalCancel}
                onSuccess={handleBookModalSuccess}
                bookId={editingBookId}
            />
        </div>
    );
};

export default AdminBooksPage;

