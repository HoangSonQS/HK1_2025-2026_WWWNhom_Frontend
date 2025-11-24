import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin, Empty, message } from 'antd';
import { BookOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { getBooksByCategory } from '../features/book/api/bookService';
import { getAllCategories } from '../features/category/api/categoryService';
import '../styles/home.css';

const { Content } = Layout;

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [booksByCategory, setBooksByCategory] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            loadBooksByCategories();
        }
    }, [categories]);

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadBooksByCategories = async () => {
        setLoading(true);
        const booksMap = {};
        
        try {
            await Promise.all(
                categories.map(async (category) => {
                    try {
                        const response = await getBooksByCategory(category.id, 10);
                        booksMap[category.id] = response.data || [];
                    } catch (error) {
                        console.error(`Error loading books for category ${category.id}:`, error);
                        booksMap[category.id] = [];
                    }
                })
            );
            setBooksByCategory(booksMap);
        } catch (error) {
            console.error('Error loading books by categories:', error);
            message.error('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMore = (categoryId) => {
        navigate(`/books?category=${categoryId}`);
    };

    return (
        <Layout className="home-layout">
            <Header />
            <Content className="home-content">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Chào mừng đến với SEBook</h1>
                        <p className="hero-subtitle">Khám phá thế giới sách với bộ sưu tập đa dạng và phong phú</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="content-header">
                        <h2 className="section-title">
                            <BookOutlined /> Sách theo thể loại
                        </h2>
                    </div>

                    <Spin spinning={loading}>
                        {categories.length === 0 ? (
                            <Empty description="Không có thể loại nào" />
                        ) : (
                            <div className="categories-sections">
                                {categories.map((category) => {
                                    const books = booksByCategory[category.id] || [];
                                    if (books.length === 0) return null;

                                    return (
                                        <div key={category.id} className="category-section">
                                            <div className="category-header">
                                                <h3 className="category-title">{category.name}</h3>
                                                <Button
                                                    type="link"
                                                    icon={<RightOutlined />}
                                                    onClick={() => handleViewMore(category.id)}
                                                    className="view-more-button"
                                                >
                                                    Xem thêm
                                                </Button>
                                            </div>
                                            <div className="books-horizontal-scroll">
                                                {books.map((book) => (
                                                    <div key={book.id} className="book-card-wrapper">
                                                        <BookCard
                                                            book={book}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Spin>

                    {categories.length === 0 && !loading && (
                        <Empty description="Không có sách nào" />
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default Home;
