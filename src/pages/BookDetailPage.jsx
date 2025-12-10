import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Card, Spin, Button, message, Empty, Tag, Space, Row, Col, Divider } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, ThunderboltOutlined, SafetyOutlined, GiftOutlined } from '@ant-design/icons';
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
    const location = useLocation();
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
                onClick={() => {
                    const from = location.state?.from;
                    if (from) {
                        navigate(from, { replace: true });
                    } else if (window.history.length > 1) {
                        navigate(-1);
                    } else {
                        navigate('/books');
                    }
                }}
                className="back-button"
            >
                Quay lại
            </Button>

            <Card className="book-detail-card">
                        <Row gutter={[32, 32]}>
                            {/* Cột trái - Hình ảnh và Actions */}
                            <Col xs={24} md={10} lg={8}>
                                <div className="book-image-section">
                                    {/* Hình ảnh chính */}
                                    <div className="book-main-image">
                        <img
                                            src={book.imageUrl ? getImageUrl(book.imageUrl) : '/placeholder-book.jpg'}
                            alt={book.title}
                            onError={(e) => {
                                e.target.src = '/placeholder-book.jpg';
                            }}
                        />
                    </div>

                                    {/* Action Buttons */}
                                    <div className="book-action-buttons">
                                        <AddToCartButton 
                                            book={book} 
                                            size="large" 
                                            block 
                                            className="add-to-cart-btn"
                                        />
                                        <BuyNowButton 
                                            book={book} 
                                            size="large" 
                                            block 
                                            className="buy-now-btn"
                                        />
                                    </div>

                                    {/* Chính sách ưu đãi */}
                                    <Card className="policy-card" size="small">
                                        <div className="policy-title">
                                            <GiftOutlined /> Chính sách ưu đãi
                                        </div>
                                        <div className="policy-item">
                                            <ThunderboltOutlined /> Giao hàng nhanh và uy tín
                                        </div>
                                        <div className="policy-item">
                                            <SafetyOutlined /> Đổi trả miễn phí toàn quốc
                                        </div>
                                        <div className="policy-item">
                                            <ShoppingCartOutlined /> Ưu đãi khi mua số lượng lớn
                                        </div>
                                    </Card>
                                </div>
                            </Col>

                            {/* Cột phải - Thông tin chi tiết */}
                            <Col xs={24} md={14} lg={16}>
                                <div className="book-info-section">
                                    {/* Tiêu đề */}
                        <h1 className="book-detail-title">{book.title}</h1>

                                    {/* Thông tin cơ bản */}
                                    <div className="book-basic-info">
                            {book.categoryNames && book.categoryNames.length > 0 && (
                                            <div className="book-categories">
                                        {Array.from(book.categoryNames).map((categoryName, index) => (
                                                    <Tag key={index} color="blue" className="category-tag">
                                                {categoryName}
                                            </Tag>
                                        ))}
                                            </div>
                                        )}
                                        <div className="book-price-section">
                                            <span className="price-label">Giá:</span>
                                            <span className="price-value">{book.price.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        {book.quantity > 0 ? (
                                            <div className="book-stock">
                                                <span className="stock-label">Tình trạng:</span>
                                                <span className="stock-value in-stock">Còn hàng ({book.quantity} cuốn)</span>
                                            </div>
                                        ) : (
                                            <div className="book-stock">
                                                <span className="stock-label">Tình trạng:</span>
                                                <span className="stock-value out-of-stock">Hết hàng</span>
                                            </div>
                                        )}
                                    </div>

                                    <Divider />

                                    {/* Thông tin chi tiết */}
                                    <div className="book-detail-info-section">
                                        <h2 className="section-title">Thông tin chi tiết</h2>
                                        <div className="detail-info-table">
                                            <div className="detail-row">
                                                <span className="detail-label">Mã sản phẩm:</span>
                                                <span className="detail-value">#{book.id}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Tác giả:</span>
                                                <span className="detail-value">{book.author}</span>
                                            </div>
                                            {book.publicationYear && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Năm XB:</span>
                                                    <span className="detail-value">{book.publicationYear}</span>
                                                </div>
                                            )}
                                            {book.weightGrams && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Trọng lượng (gr):</span>
                                                    <span className="detail-value">{book.weightGrams}</span>
                                                </div>
                                            )}
                                            {book.packageDimensions && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Kích Thước Bao Bì:</span>
                                                    <span className="detail-value">{book.packageDimensions}</span>
                                                </div>
                                            )}
                                            {book.pageCount && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Số trang:</span>
                                                    <span className="detail-value">{book.pageCount}</span>
                                </div>
                            )}
                                            {book.format && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Hình thức:</span>
                                                    <span className="detail-value">{book.format}</span>
                            </div>
                                            )}
                            </div>
                        </div>

                                    {/* Mô tả sản phẩm */}
                                    {book.description && (
                                        <>
                                            <Divider />
                                            <div className="book-description-section">
                                                <h2 className="section-title">Mô tả sản phẩm</h2>
                                                <div className="book-description">
                                                    {book.description}
                        </div>
                    </div>
                                        </>
                                    )}
                </div>
                            </Col>
                        </Row>
            </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default BookDetailPage;

