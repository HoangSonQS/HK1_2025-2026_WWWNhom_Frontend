import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Input, Select, Button, Spin, Empty, message, Checkbox, Slider, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getAllBooks, searchBooks, filterBooksByCategory } from '../features/book/api/bookService';
import { getAllCategories } from '../features/category/api/categoryService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import { isAdminOrStaff } from '../utils/jwt';
import '../styles/books.css';

const { Content } = Layout;
const { Option } = Select;

const BooksPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000000]); // 0 đến 10 triệu
    const [maxPrice, setMaxPrice] = useState(10000000); // Giá tối đa 10 triệu
    const [isPriceCheckboxActive, setIsPriceCheckboxActive] = useState(false); // Track xem có đang lọc theo checkbox giá không
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [isAdminStaff, setIsAdminStaff] = useState(false);

    useEffect(() => {
        loadBooks();
        loadCategories();
        setIsAdminStaff(isAdminOrStaff());
        
        // Đọc query parameters từ URL
        const searchParam = searchParams.get('search');
        const categoryParam = searchParams.get('category');
        
        if (searchParam) {
            // Nếu có search param, tìm kiếm và lọc
            handleSearch(searchParam);
        } else if (categoryParam) {
            setSelectedCategories([parseInt(categoryParam)]);
            handleCategoryFilter([parseInt(categoryParam)]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await getAllBooks();
            const booksData = response.data || [];
            setAllBooks(booksData);
            setBooks(booksData);
            
            // Tính giá cao nhất trong dữ liệu (nhưng vẫn giữ max là 10 triệu)
            if (booksData.length > 0) {
                const dataMaxPrice = Math.max(...booksData.map(book => book.price));
                // Nếu giá cao nhất trong dữ liệu < 10 triệu, vẫn giữ max là 10 triệu
                setMaxPrice(10000000);
            }
        } catch (error) {
            console.error('Error loading books:', error);
            message.error('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSearch = async (value) => {
        if (!value.trim()) {
            // Nếu không có từ khóa, hiển thị toàn bộ sách
            setSearchParams({});
            applyFilters();
            return;
        }

        setLoading(true);
        setSearchParams({ search: value });
        try {
            const response = await searchBooks(value);
            const searchedBooks = response.data || [];
            // Áp dụng lọc giá và thể loại cho kết quả tìm kiếm
            let filteredBooks = applyPriceFilter(searchedBooks);
            if (selectedCategories.length > 0) {
                filteredBooks = filteredBooks.filter(book => {
                    if (!book.categoryIds) return false;
                    const bookCategoryIds = Array.isArray(book.categoryIds) 
                        ? book.categoryIds 
                        : Array.from(book.categoryIds || []);
                    return selectedCategories.some(catId => bookCategoryIds.includes(catId));
                });
            }
            setBooks(filteredBooks);
        } catch (error) {
            console.error('Error searching books:', error);
            message.error('Không thể tìm kiếm sách');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = async (categoryIds) => {
        setSelectedCategories(categoryIds);
        // Gọi applyFilters để lọc theo cả thể loại và giá
        setTimeout(() => applyFilters(), 100);
    };

    const applyPriceFilter = (booksToFilter) => {
        // Chỉ lọc theo giá nếu đang active checkbox giá hoặc slider đã được điều chỉnh khác mặc định
        if (!isPriceCheckboxActive && priceRange[0] === 0 && priceRange[1] === maxPrice) {
            return booksToFilter; // Không lọc, trả về toàn bộ
        }
        return booksToFilter.filter(book => 
            book.price >= priceRange[0] && book.price <= priceRange[1]
        );
    };

    const applyFilters = () => {
        let filteredBooks = allBooks;
        
        // Lọc theo thể loại
        if (selectedCategories.length > 0) {
            filteredBooks = filteredBooks.filter(book => {
                if (!book.categoryIds) return false;
                const bookCategoryIds = Array.isArray(book.categoryIds) 
                    ? book.categoryIds 
                    : Array.from(book.categoryIds || []);
                return selectedCategories.some(catId => bookCategoryIds.includes(catId));
            });
        }
        
        // Lọc theo giá
        filteredBooks = applyPriceFilter(filteredBooks);
        
        // Sắp xếp
        if (sortBy) {
            filteredBooks = [...filteredBooks].sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (sortOrder === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        setBooks(filteredBooks);
    };

    const handlePriceRangeChange = (value) => {
        setPriceRange(value);
        // Khi dùng slider, tự động bỏ active checkbox giá
        setIsPriceCheckboxActive(false);
    };

    const handlePriceRangeAfterChange = (value) => {
        setPriceRange(value);
        setIsPriceCheckboxActive(false);
        applyFilters();
    };

    const handleSort = (field, order) => {
        setSortBy(field);
        setSortOrder(order);
        const sortedBooks = [...books].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        setBooks(sortedBooks);
    };

    const handleBookDelete = (bookId) => {
        setBooks(books.filter(book => book.id !== bookId));
        setAllBooks(allBooks.filter(book => book.id !== bookId));
    };

    const getCategoryBookCount = (categoryId) => {
        return allBooks.filter(book => {
            if (!book.categoryIds) return false;
            // categoryIds có thể là Set hoặc Array
            if (Array.isArray(book.categoryIds)) {
                return book.categoryIds.includes(categoryId);
            }
            if (book.categoryIds instanceof Set) {
                return book.categoryIds.has(categoryId);
            }
            return false;
        }).length;
    };

    const getPriceRangeBookCount = () => {
        return allBooks.filter(book => 
            book.price >= priceRange[0] && book.price <= priceRange[1]
        ).length;
    };

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN');
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Header />
            <Content>
                <div className="books-page-container">
                    {isAdminStaff && (
                        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                className="login-button"
                                onClick={() => navigate('/books/add')}
                            >
                                Thêm sách mới
                            </Button>
                        </div>
                    )}

                    <Row gutter={24}>
                        {/* Filter Sidebar */}
                        <Col xs={24} sm={24} md={6} lg={5}>
                            <Card 
                                title={<span style={{ color: '#d32f2f', fontWeight: 'bold' }}>LỌC THEO</span>}
                                className="filter-sidebar"
                                style={{ marginBottom: 24 }}
                            >
                                {/* Category Filter */}
                                <div style={{ marginBottom: 24 }}>
                                    <h4 style={{ marginBottom: 12, fontWeight: 600 }}>DANH MỤC CHÍNH</h4>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {categories.map(category => {
                                            const count = getCategoryBookCount(category.id);
                                            return (
                                                <div key={category.id} style={{ marginBottom: 8 }}>
                                                    <Checkbox
                                                        checked={selectedCategories.includes(category.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                handleCategoryFilter([...selectedCategories, category.id]);
                                                            } else {
                                                                handleCategoryFilter(selectedCategories.filter(id => id !== category.id));
                                                            }
                                                        }}
                                                    >
                                                        {category.name} ({count})
                                                    </Checkbox>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <h4 style={{ marginBottom: 12, fontWeight: 600 }}>GIÁ</h4>
                                    <div style={{ marginBottom: 16 }}>
                                        {[
                                            { label: '0₫ - 150,000₫', range: [0, 150000] },
                                            { label: '150,000₫ - 300,000₫', range: [150000, 300000] },
                                            { label: '300,000₫ - 500,000₫', range: [300000, 500000] },
                                            { label: '500,000₫ - 700,000₫', range: [500000, 700000] },
                                            { label: '700,000₫ Trở Lên', range: [700000, maxPrice] }
                                        ].map((priceOption, index) => {
                                            const count = allBooks.filter(book => 
                                                book.price >= priceOption.range[0] && 
                                                book.price <= priceOption.range[1]
                                            ).length;
                                            const isChecked = isPriceCheckboxActive && 
                                                             priceRange[0] === priceOption.range[0] && 
                                                             priceRange[1] === priceOption.range[1];
                                            return (
                                                <div key={index} style={{ marginBottom: 8 }}>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                // Chọn checkbox -> lọc theo khoảng giá này
                                                                setIsPriceCheckboxActive(true);
                                                                setPriceRange(priceOption.range);
                                                                // Gọi applyFilters ngay lập tức
                                                                setTimeout(() => {
                                                                    applyFilters();
                                                                }, 50);
                                                            } else {
                                                                // Bỏ chọn -> hiển thị toàn bộ sách (không lọc theo giá)
                                                                setIsPriceCheckboxActive(false);
                                                                setPriceRange([0, maxPrice]);
                                                                // Gọi applyFilters ngay lập tức
                                                                setTimeout(() => {
                                                                    applyFilters();
                                                                }, 50);
                                                            }
                                                        }}
                                                    >
                                                        {priceOption.label} ({count})
                                                    </Checkbox>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: 16 }}>
                                        <p style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                                            Hoặc chọn mức giá phù hợp
                                        </p>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                                            <Input
                                                type="text"
                                                placeholder="0"
                                                value={formatPrice(priceRange[0])}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^\d]/g, '');
                                                    const numVal = parseInt(val) || 0;
                                                    const finalVal = Math.max(0, Math.min(maxPrice, numVal));
                                                    if (finalVal <= priceRange[1]) {
                                                        setIsPriceCheckboxActive(false); // Bỏ active checkbox khi nhập tay
                                                        setPriceRange([finalVal, priceRange[1]]);
                                                    }
                                                }}
                                                onBlur={applyFilters}
                                                style={{ width: '140px' }}
                                                addonAfter="đ"
                                            />
                                            <span style={{ margin: '0 4px' }}>-</span>
                                            <Input
                                                type="text"
                                                placeholder="0"
                                                value={formatPrice(priceRange[1])}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^\d]/g, '');
                                                    const numVal = parseInt(val) || maxPrice;
                                                    const finalVal = Math.max(0, Math.min(maxPrice, numVal));
                                                    if (finalVal >= priceRange[0]) {
                                                        setIsPriceCheckboxActive(false); // Bỏ active checkbox khi nhập tay
                                                        setPriceRange([priceRange[0], finalVal]);
                                                    }
                                                }}
                                                onBlur={applyFilters}
                                                style={{ width: '140px' }}
                                                addonAfter="đ"
                                            />
                                        </div>
                                        <div className="price-slider-wrapper">
                                            <Slider
                                                range
                                                min={0}
                                                max={maxPrice}
                                                value={priceRange}
                                                onChange={handlePriceRangeChange}
                                                onAfterChange={handlePriceRangeAfterChange}
                                                step={50000}
                                                tooltip={{
                                                    formatter: (value) => `${formatPrice(value)} đ`
                                                }}
                                                className="price-range-slider"
                                            />
                                        </div>
                                        <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>
                                            {getPriceRangeBookCount() > 0 ? (
                                                <span>Có {getPriceRangeBookCount()} sách trong khoảng {formatPrice(priceRange[0])} đ - {formatPrice(priceRange[1])} đ</span>
                                            ) : (
                                                <span style={{ color: '#d32f2f' }}>Không có sách {formatPrice(priceRange[0])} đ - {formatPrice(priceRange[1])} đ</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* Main Content */}
                        <Col xs={24} sm={24} md={18} lg={19}>
                            <div className="books-controls">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={24} md={24}>
                                        <Select
                                            placeholder="Sắp xếp"
                                            allowClear
                                            size="large"
                                            style={{ width: '100%', maxWidth: '300px' }}
                                            value={sortBy ? `${sortBy}-${sortOrder}` : null}
                                            onChange={(value) => {
                                                if (value) {
                                                    const [field, order] = value.split('-');
                                                    handleSort(field, order);
                                                } else {
                                                    setSortBy(null);
                                                    setSortOrder('asc');
                                                    applyFilters();
                                                }
                                            }}
                                        >
                                            <Option value="title-asc">Tên A-Z</Option>
                                            <Option value="title-desc">Tên Z-A</Option>
                                            <Option value="price-asc">Giá tăng dần</Option>
                                            <Option value="price-desc">Giá giảm dần</Option>
                                            <Option value="author-asc">Tác giả A-Z</Option>
                                            <Option value="author-desc">Tác giả Z-A</Option>
                                        </Select>
                                    </Col>
                                </Row>
                            </div>

                            <Spin spinning={loading}>
                                <div className="books-list">
                                    {books.length === 0 ? (
                                        <Empty description="Không có sách nào" />
                                    ) : (
                                        <Row gutter={[16, 16]}>
                                            {books.map(book => (
                                                <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                                                    <BookCard
                                                        book={book}
                                                        onDelete={handleBookDelete}
                                                        isAdminOrStaff={isAdminStaff}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </div>
                            </Spin>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

export default BooksPage;
