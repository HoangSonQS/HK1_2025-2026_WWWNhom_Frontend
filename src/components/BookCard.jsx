import React from "react";
import { Card, Tag, Space } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/imageUtils";
import AddToCartButton from "./AddToCartButton";
import BuyNowButton from "./BuyNowButton";

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Card
      hoverable
      className="book-card"
      cover={
        <div
          style={{
            width: "100%",
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8f9fa",
            overflow: "hidden",
          }}
        >
          <img
            alt={book.title}
            src={getImageUrl(book.imageUrl)}
            className="book-image"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-book.jpg";
            }}
          />
        </div>
      }
      onClick={(e) => {
        // Nếu event đã bị preventDefault từ các nút bên trong thì không điều hướng
        if (e.defaultPrevented) return;
        const fromPath = location.pathname + location.search;
        navigate(`/books/${book.id}`, { state: { from: fromPath } });
      }}
    >
      <Card.Meta
        title={<div className="book-title">{book.title}</div>}
        description={
          <div className="book-meta-content">
            <div className="book-author">Tác giả: {book.author}</div>
            {book.categoryNames && book.categoryNames.length > 0 && (
              <div className="book-tags">
                {Array.from(book.categoryNames).map((categoryName, index) => (
                  <Tag key={index} color="blue">
                    {categoryName}
                  </Tag>
                ))}
              </div>
            )}
            <div className="book-price">
              {book.price.toLocaleString("vi-VN")} đ
            </div>
            <div className="book-quantity">Còn lại: {book.quantity}</div>
            <div
              className="book-card-actions"
              onClick={(e) => {
                // Chặn nổi bọt để không kích hoạt onClick của Card
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <BuyNowButton book={book} size="small" block />
                <AddToCartButton book={book} size="small" block />
              </Space>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default BookCard;
