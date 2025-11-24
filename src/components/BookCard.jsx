import React from 'react';
import { Card, Button, Popconfirm, message, Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { deleteBook } from '../features/book/api/bookService';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const BookCard = ({ book, onDelete, isAdminOrStaff }) => {
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await deleteBook(book.id);
            message.success('Xóa sách thành công!');
            if (onDelete) {
                onDelete(book.id);
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            const errorMsg = error.response?.data?.message || 'Xóa sách thất bại';
            message.error(errorMsg);
        }
    };

    const handleEdit = () => {
        navigate(`/books/${book.id}/edit`);
    };

    return (
        <Card
            hoverable
            className="book-card"
            cover={
                <div style={{ 
                    width: '100%', 
                    height: '280px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#f8f9fa',
                    overflow: 'hidden'
                }}>
                    <img
                        alt={book.title}
                        src={getImageUrl(book.imageUrl)}
                        className="book-image"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                        onError={(e) => {
                            e.target.src = '/placeholder-book.jpg';
                        }}
                    />
                </div>
            }
            actions={
                isAdminOrStaff
                    ? [
                        <Button
                            key="edit"
                            type="link"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                            }}
                        >
                            Sửa
                        </Button>,
                        <Popconfirm
                            key="delete"
                            title="Bạn có chắc chắn muốn xóa sách này?"
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDelete();
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    ]
                    : []
            }
            onClick={() => navigate(`/books/${book.id}`)}
        >
            <Card.Meta
                title={<div className="book-title">{book.title}</div>}
                description={
                    <div>
                        <div className="book-author">Tác giả: {book.author}</div>
                        {book.categoryNames && book.categoryNames.length > 0 && (
                            <div style={{ marginTop: 8, marginBottom: 8 }}>
                                {Array.from(book.categoryNames).map((categoryName, index) => (
                                    <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                        {categoryName}
                                    </Tag>
                                ))}
                            </div>
                        )}
                        <div className="book-price">{book.price.toLocaleString('vi-VN')} đ</div>
                        <div className="book-quantity">Còn lại: {book.quantity}</div>
                    </div>
                }
            />
        </Card>
    );
};

export default BookCard;

