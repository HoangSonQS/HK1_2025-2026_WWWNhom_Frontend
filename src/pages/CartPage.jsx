import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  InputNumber,
  Empty,
  Spin,
  message,
  Space,
  Typography,
  Divider,
  Tag,
  Checkbox,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../features/cart/api/cartService";
import { getImageUrl } from "../utils/imageUtils";
import { ROUTES } from "../utils/constants";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      const cartData = response.data;

      // Sắp xếp items theo cartItemId để đảm bảo thứ tự ổn định
      if (cartData.items && cartData.items.length > 0) {
        cartData.items = [...cartData.items].sort(
          (a, b) => (a.cartItemId || 0) - (b.cartItemId || 0)
        );
      }

      setCart(cartData);
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem giỏ hàng");
        navigate(ROUTES.LOGIN);
      } else {
        message.error("Không thể tải giỏ hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      message.warning("Số lượng phải lớn hơn 0");
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await updateCartItem(cartItemId, newQuantity);

      // Cập nhật local state thay vì reload để giữ nguyên thứ tự
      setCart((prevCart) => {
        if (!prevCart || !prevCart.items) return prevCart;

        const updatedItems = prevCart.items.map((item) => {
          if (item.cartItemId === cartItemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.bookPrice * item.quantity,
          0
        );

        return {
          ...prevCart,
          items: updatedItems,
          totalPrice: totalPrice,
        };
      });

      // Trigger event để cập nhật cart count trong Header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      message.success("Đã cập nhật số lượng");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật số lượng";
      message.error(errorMessage);
      // Reload cart nếu có lỗi để đồng bộ lại
      await loadCart();
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      await removeCartItem(cartItemId);

      // Cập nhật local state thay vì reload để giữ nguyên thứ tự
      setCart((prevCart) => {
        if (!prevCart || !prevCart.items) return prevCart;

        const updatedItems = prevCart.items.filter(
          (item) => item.cartItemId !== cartItemId
        );

        if (updatedItems.length === 0) {
          return { items: [], totalPrice: 0 };
        }

        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.bookPrice * item.quantity,
          0
        );

        return {
          ...prevCart,
          items: updatedItems,
          totalPrice: totalPrice,
        };
      });

      // Xoá khỏi selectedItems nếu có
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });

      // Trigger event để cập nhật cart count trong Header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      message.success("Đã Xoá sản phẩm khỏi giỏ hàng");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể Xoá sản phẩm";
      message.error(errorMessage);
      // Reload cart nếu có lỗi để đồng bộ lại
      await loadCart();
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) {
      message.warning("Vui lòng chọn sản phẩm cần Xoá");
      return;
    }

    const itemsToRemove = Array.from(selectedItems);
    setUpdatingItems(new Set(itemsToRemove));

    try {
      // Xoá tất cả items đã chọn
      await Promise.all(itemsToRemove.map((itemId) => removeCartItem(itemId)));

      // Cập nhật local state
      setCart((prevCart) => {
        if (!prevCart || !prevCart.items) return prevCart;

        const updatedItems = prevCart.items.filter(
          (item) => !selectedItems.has(item.cartItemId)
        );

        if (updatedItems.length === 0) {
          return { items: [], totalPrice: 0 };
        }

        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.bookPrice * item.quantity,
          0
        );

        return {
          ...prevCart,
          items: updatedItems,
          totalPrice: totalPrice,
        };
      });

      // Xoá tất cả selected items
      setSelectedItems(new Set());

      // Trigger event để cập nhật cart count trong Header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      message.success(`Đã Xoá ${itemsToRemove.length} sản phẩm khỏi giỏ hàng`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể Xoá sản phẩm";
      message.error(errorMessage);
      // Reload cart nếu có lỗi để đồng bộ lại
      await loadCart();
    } finally {
      setUpdatingItems(new Set());
    }
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      message.warning("Giỏ hàng trống");
      return;
    }
    // TODO: Navigate to checkout page when implemented
    message.info("Tính năng thanh toán đang được phát triển");
  };

  if (loading && !cart) {
    return (
      <Layout className="cart-layout">
        <Header />
        <Content className="cart-content">
          <Spin
            size="large"
            style={{ display: "block", textAlign: "center", padding: "50px" }}
          />
        </Content>
      </Layout>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <Layout className="cart-layout">
      <Header />
      <Content className="cart-content">
        <div className="cart-container">
          <Title level={2} style={{ marginBottom: 16, color: "#333" }}>
            GIỎ HÀNG{" "}
            {cart && cart.items ? `(${cart.items.length} sản phẩm)` : ""}
          </Title>

          {isEmpty ? (
            <Card>
              <Empty
                description="Giỏ hàng trống"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
                  Mua sắm ngay
                </Button>
              </Empty>
            </Card>
          ) : (
            <div className="cart-wrapper">
              <div className="cart-items">
                {/* Header với checkbox và nút Xoá */}
                <Card className="cart-header-card" style={{ marginBottom: 16 }}>
                  <div className="cart-header-content">
                    <Checkbox
                      checked={
                        selectedItems.size === cart.items.length &&
                        cart.items.length > 0
                      }
                      indeterminate={
                        selectedItems.size > 0 &&
                        selectedItems.size < cart.items.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(
                            new Set(cart.items.map((item) => item.cartItemId))
                          );
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    >
                      Chọn tất cả ({cart.items.length} sản phẩm)
                    </Checkbox>
                    {selectedItems.size > 0 && (
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveSelected}
                        disabled={updatingItems.size > 0}
                      >
                        Xoá ({selectedItems.size}) sản phẩm
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Danh sách sản phẩm */}
                {cart.items.map((item) => (
                  <Card
                    key={item.cartItemId}
                    className="cart-item-card"
                    style={{ marginBottom: 16 }}
                    loading={updatingItems.has(item.cartItemId)}
                  >
                    <div className="cart-item-content">
                      <Checkbox
                        checked={selectedItems.has(item.cartItemId)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedItems);
                          if (e.target.checked) {
                            newSelected.add(item.cartItemId);
                          } else {
                            newSelected.delete(item.cartItemId);
                          }
                          setSelectedItems(newSelected);
                        }}
                      />
                      <div className="cart-item-image">
                        <img
                          src={getImageUrl(item.bookImageUrl)}
                          alt={item.bookTitle}
                          onError={(e) => {
                            e.target.src = "/placeholder-book.jpg";
                          }}
                        />
                      </div>
                      <div className="cart-item-info">
                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            marginBottom: 8,
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/books/${item.bookId}`)}
                        >
                          {item.bookTitle}
                        </Title>
                        {item.bookAuthor && (
                          <Text
                            type="secondary"
                            style={{ display: "block", marginBottom: 4 }}
                          >
                            Tác giả: {item.bookAuthor}
                          </Text>
                        )}
                        {item.categoryNames &&
                          item.categoryNames.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              {Array.from(item.categoryNames).map(
                                (categoryName, index) => (
                                  <Tag
                                    key={index}
                                    color="blue"
                                    style={{ marginBottom: 4, fontSize: 11 }}
                                  >
                                    {categoryName}
                                  </Tag>
                                )
                              )}
                            </div>
                          )}
                        <div style={{ marginBottom: 4 }}>
                          <Text
                            strong
                            style={{ fontSize: 18, color: "#f5222d" }}
                          >
                            {item.bookPrice.toLocaleString("vi-VN")} đ
                          </Text>
                        </div>
                        {item.bookStockQuantity !== undefined && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Còn lại: {item.bookStockQuantity} cuốn
                          </Text>
                        )}
                      </div>
                      <div className="cart-item-quantity">
                        <Space direction="vertical" align="center" size="small">
                          <Text strong>Số lượng</Text>
                          <Space>
                            <Button
                              icon={<MinusOutlined />}
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.cartItemId,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                updatingItems.has(item.cartItemId) ||
                                item.quantity <= 1
                              }
                            />
                            <InputNumber
                              min={1}
                              max={item.bookStockQuantity}
                              value={item.quantity}
                              onChange={(value) => {
                                if (value && value > 0) {
                                  handleUpdateQuantity(item.cartItemId, value);
                                }
                              }}
                              disabled={updatingItems.has(item.cartItemId)}
                              style={{ width: 60 }}
                            />
                            <Button
                              icon={<PlusOutlined />}
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.cartItemId,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                updatingItems.has(item.cartItemId) ||
                                item.quantity >= (item.bookStockQuantity || 999)
                              }
                            />
                          </Space>
                        </Space>
                      </div>
                      <div className="cart-item-total">
                        <Space direction="vertical" align="end" size="small">
                          <Text strong>Thành tiền</Text>
                          <Text
                            strong
                            style={{ fontSize: 16, color: "#f5222d" }}
                          >
                            {(item.bookPrice * item.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            đ
                          </Text>
                        </Space>
                      </div>
                      <div className="cart-item-remove">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.cartItemId)}
                          disabled={updatingItems.has(item.cartItemId)}
                          size="small"
                          className="remove-item-button"
                        >
                          Xoá
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="cart-summary">
                <Card>
                  <Title level={4}>Tóm tắt đơn hàng</Title>
                  <Divider />
                  <div className="summary-row">
                    <Text>Số lượng sản phẩm:</Text>
                    <Text strong>
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Text>
                  </div>
                  <div className="summary-row">
                    <Text>Tổng tiền:</Text>
                    <Text strong style={{ fontSize: 20, color: "#f5222d" }}>
                      {cart.totalPrice.toLocaleString("vi-VN")} đ
                    </Text>
                  </div>
                  <Divider />
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleCheckout}
                    style={{ marginTop: 16 }}
                  >
                    Thanh toán
                  </Button>
                  <Button
                    type="default"
                    block
                    onClick={() => navigate(ROUTES.HOME)}
                    style={{ marginTop: 8 }}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default CartPage;
