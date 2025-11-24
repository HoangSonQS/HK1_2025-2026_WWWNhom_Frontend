import React from 'react';
import { Card, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const BookCard = ({ book }) => {
    const navigate = useNavigate();

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

