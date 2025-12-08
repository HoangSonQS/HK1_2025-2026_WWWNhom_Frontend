import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Spin, Button, message, Empty, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getBookById } from '../features/book/api/bookService';
import { getImageUrl } from '../utils/imageUtils';
import Header from '../components/Header';
import BuyNowButton from '../components/BuyNowButton';
import AddToCartButton from '../components/AddToCartButton';
import '../styles/books.css';

const { Content } = Layout;

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBook();
    }, [id]);

    const loadBook = async () => {
        setLoading(true);
        try {
            const response = await getBookById(id);
            setBook(response.data);
        } catch (error) {
            console.error('Error loading book:', error);
            message.error('Không thể tải thông tin sách');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
                <Header />
                <Content>
                    <div className="book-detail-container">
                        <Spin size="large" />
                    </div>
                </Content>
            </Layout>
        );
    }

    if (!book) {
        return (
            <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
                <Header />
                <Content>
                    <div className="book-detail-container">
                        <Empty description="Không tìm thấy sách" />
                    </div>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header />
            <Content>
                <div className="book-detail-container">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('-1')}
                className="back-button"
            >
                Quay lại
            </Button>

            <Card className="book-detail-card">
                <div className="book-detail-content">
                    <div className="book-detail-image">
                        <img
                            src={getImageUrl(book.imageUrl)}
                            alt={book.title}
                            onError={(e) => {
                                e.target.src = '/placeholder-book.jpg';
                            }}
                        />
                    </div>
                    <div className="book-detail-info">
                        <h1 className="book-detail-title">{book.title}</h1>
                        <div className="book-detail-meta">
                            <div className="book-detail-author">
                                <strong>Tác giả:</strong> {book.author}
                            </div>
                            {book.categoryNames && book.categoryNames.length > 0 && (
                                <div style={{ marginTop: 12, marginBottom: 12 }}>
                                    <strong>Thể loại:</strong>
                                    <div style={{ marginTop: 8 }}>
                                        {Array.from(book.categoryNames).map((categoryName, index) => (
                                            <Tag key={index} color="blue" style={{ marginRight: 8, marginBottom: 4 }}>
                                                {categoryName}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="book-detail-price">
                                <strong>Giá:</strong> {book.price.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="book-detail-quantity">
                                <strong>Số lượng còn lại:</strong> {book.quantity}
                            </div>
                        </div>
                        <div style={{ marginTop: 24 }}>
                            <Space direction="vertical" style={{ width: '300px' }} size="middle">
                                <BuyNowButton book={book} size="large" block />
                                <AddToCartButton book={book} size="large" block />
                            </Space>
                        </div>
                    </div>
                </div>
            </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default BookDetailPage;

