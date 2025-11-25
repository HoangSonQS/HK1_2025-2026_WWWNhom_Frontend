import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  Spin,
  message,
  Typography,
  Divider,
  Tag,
  Empty,
  Space,
  Input,
  Radio,
  Form,
} from "antd";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getCart } from "../features/cart/api/cartService";
import { createOrder } from "../features/order/api/orderService";
import { getMyAddresses } from "../features/address/api/addressService";
import { validatePromotionCode } from "../features/promotion/api/promotionService";
import { getImageUrl } from "../utils/imageUtils";
import { ROUTES } from "../utils/constants";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionError, setPromotionError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [validatingPromotion, setValidatingPromotion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  useEffect(() => {
    if (cart) {
      calculateTotal();
    }
  }, [cart, appliedPromotion]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      const cartData = response.data;

      if (!cartData.items || cartData.items.length === 0) {
        message.warning("Giỏ hàng trống");
        navigate(ROUTES.CART);
        return;
      }

      setCart(cartData);
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để thanh toán");
        navigate(ROUTES.LOGIN);
      } else {
        message.error("Không thể tải giỏ hàng");
        navigate(ROUTES.CART);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await getMyAddresses();
      const addressesData = response.data || [];
      setAddresses(addressesData);

      // Tự động chọn địa chỉ mặc định
      const defaultAddress = addressesData.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        form.setFieldsValue({ addressId: defaultAddress.id });
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const calculateTotal = () => {
    if (!cart) return;

    const subtotal = cart.totalPrice || 0;
    let discount = 0;

    if (appliedPromotion) {
      discount = subtotal * (appliedPromotion.discountPercent / 100);
    }

    setDiscountAmount(discount);
    setFinalTotal(subtotal - discount);
  };

  const handleValidatePromotion = async () => {
    if (!promotionCode.trim()) {
      setPromotionError("Vui lòng nhập mã khuyến mãi");
      return;
    }

    setValidatingPromotion(true);
    setPromotionError("");
    try {
      const response = await validatePromotionCode(promotionCode.trim());
      setAppliedPromotion(response.data);
      setPromotionError("");
    } catch (error) {
      setAppliedPromotion(null);
      const errorMessage = error.response?.data?.message || error.message || "";
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("Invalid") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("không tồn tại")
      ) {
        setPromotionError("Mã khuyến mãi không tồn tại");
      } else if (errorMessage) {
        setPromotionError(errorMessage);
      } else {
        setPromotionError("Mã khuyến mãi không tồn tại");
      }
    } finally {
      setValidatingPromotion(false);
    }
  };

  const handleRemovePromotion = () => {
    setPromotionCode("");
    setAppliedPromotion(null);
    setPromotionError("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      message.warning("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        promotionCode: appliedPromotion ? appliedPromotion.code : null,
      };

      const response = await createOrder(orderData);
      const order = response.data;

      message.success("Đặt hàng thành công!");

      // Trigger event để cập nhật cart count trong Header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Chuyển đến trang chủ
      navigate(ROUTES.HOME);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Không thể đặt hàng";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Layout className="cart-layout">
        <Header />
        <Content className="cart-content">
          <div className="cart-container">
            <Empty description="Giỏ hàng trống" />
            <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
              Mua sắm ngay
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="cart-layout">
      <Header />
      <Content className="cart-content">
        <div className="cart-container">
          <Title level={2} style={{ marginBottom: 16, color: "#333" }}>
            THANH TOÁN
          </Title>

          <Form form={form} layout="vertical">
            <div className="cart-wrapper">
              {/* Cột trái: Thông tin đơn hàng */}
              <div className="cart-items" style={{ flex: 1 }}>
                {/* Thông tin sản phẩm */}
                <Card title="Thông tin sản phẩm" style={{ marginBottom: 16 }}>
                  {cart.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      style={{
                        display: "flex",
                        gap: 16,
                        padding: "12px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f8f9fa",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={getImageUrl(item.bookImageUrl)}
                          alt={item.bookTitle}
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
                      <div style={{ flex: 1 }}>
                        <Text strong>{item.bookTitle}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Số lượng: {item.quantity} x{" "}
                          {item.bookPrice.toLocaleString("vi-VN")} đ
                        </Text>
                        <br />
                        <Text strong style={{ color: "#f5222d" }}>
                          {(item.bookPrice * item.quantity).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đ
                        </Text>
                      </div>
                    </div>
                  ))}
                </Card>

                {/* Thông tin khách hàng và địa chỉ giao hàng */}
                <Card title="Thông tin giao hàng" style={{ marginBottom: 16 }}>
                  <Form.Item
                    name="addressId"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn địa chỉ giao hàng",
                      },
                    ]}
                  >
                    <Radio.Group
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="middle"
                      >
                        {addresses.map((address) => {
                          const fullAddress = `${address.street || ""}, ${
                            address.ward || ""
                          }, ${address.district || ""}, ${
                            address.city || ""
                          }`.replace(/^,\s*|,\s*$/g, "");
                          const displayText = `${
                            address.recipientName || ""
                          } - ${address.phoneNumber || ""}`.replace(
                            /^-\s*|-\s*$/g,
                            ""
                          );

                          return (
                            <Radio
                              key={address.id}
                              value={address.id}
                              style={{
                                width: "100%",
                                padding: "12px",
                                border:
                                  selectedAddressId === address.id
                                    ? "1px solid #1890ff"
                                    : "1px solid #d9d9d9",
                                borderRadius: 4,
                                margin: 0,
                              }}
                            >
                              <div style={{ marginLeft: 8 }}>
                                <div
                                  style={{ fontWeight: 500, marginBottom: 4 }}
                                >
                                  {displayText}
                                  {address.isDefault && (
                                    <Tag
                                      color="blue"
                                      style={{ marginLeft: 8, fontSize: 11 }}
                                    >
                                      Mặc định
                                    </Tag>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                                  {fullAddress}
                                </div>
                              </div>
                            </Radio>
                          );
                        })}
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                  {addresses.length === 0 && (
                    <Button
                      type="link"
                      onClick={() => {
                        // TODO: Navigate to add address page
                        message.info(
                          "Tính năng thêm địa chỉ đang được phát triển"
                        );
                      }}
                    >
                      + Thêm địa chỉ mới
                    </Button>
                  )}
                </Card>

                {/* Phương thức thanh toán */}
                <Card
                  title="Phương thức thanh toán"
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Space direction="vertical">
                      <Radio value="CASH">Thanh toán khi nhận hàng (COD)</Radio>
                      <Radio value="VNPAY">Thanh toán qua VNPay</Radio>
                    </Space>
                  </Radio.Group>
                </Card>

                {/* Mã khuyến mãi */}
                <Card title="Mã khuyến mãi" style={{ marginBottom: 16 }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      placeholder="Nhập mã khuyến mãi"
                      value={promotionCode}
                      onChange={(e) => {
                        setPromotionCode(e.target.value);
                        setPromotionError("");
                      }}
                      onPressEnter={handleValidatePromotion}
                      status={promotionError ? "error" : ""}
                      allowClear
                    />
                    <Button
                      type="primary"
                      loading={validatingPromotion}
                      onClick={handleValidatePromotion}
                    >
                      Áp dụng
                    </Button>
                  </Space.Compact>

                  {/* Hiển thị tag khi mã hợp lệ */}
                  {appliedPromotion && (
                    <div style={{ marginTop: 8 }}>
                      <Tag
                        color="green"
                        style={{ fontSize: 14, padding: "4px 12px" }}
                        closable
                        onClose={handleRemovePromotion}
                      >
                        Áp dụng thành công mã: {appliedPromotion.code} - Giảm{" "}
                        {appliedPromotion.discountPercent}%
                      </Tag>
                    </div>
                  )}

                  {/* Hiển thị lỗi khi mã không hợp lệ */}
                  {promotionError && (
                    <div
                      style={{ marginTop: 8, color: "#ff4d4f", fontSize: 14 }}
                    >
                      {promotionError}
                    </div>
                  )}
                </Card>
              </div>

              {/* Cột phải: Tóm tắt đơn hàng */}
              <div className="cart-summary">
                <Card>
                  <Title level={4}>Tóm tắt đơn hàng</Title>
                  <Divider />
                  <div className="summary-row">
                    <Text>Tạm tính:</Text>
                    <Text strong>
                      {cart.totalPrice.toLocaleString("vi-VN")} đ
                    </Text>
                  </div>
                  {appliedPromotion && (
                    <>
                      <div className="summary-row">
                        <Text>
                          Giảm giá ({appliedPromotion.discountPercent}%):
                        </Text>
                        <Text strong style={{ color: "#52c41a" }}>
                          -{discountAmount.toLocaleString("vi-VN")} đ
                        </Text>
                      </div>
                    </>
                  )}
                  <Divider />
                  <div className="summary-row">
                    <Text strong>Tổng cộng:</Text>
                    <Text strong style={{ fontSize: 20, color: "#f5222d" }}>
                      {finalTotal.toLocaleString("vi-VN")} đ
                    </Text>
                  </div>
                  <Divider />
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handlePlaceOrder}
                    loading={submitting}
                    disabled={!selectedAddressId}
                    style={{ marginTop: 16 }}
                  >
                    Xác nhận đặt hàng
                  </Button>
                  <Button
                    type="default"
                    block
                    onClick={() => navigate(ROUTES.CART)}
                    style={{ marginTop: 8 }}
                  >
                    Quay lại giỏ hàng
                  </Button>
                </Card>
              </div>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default CheckoutPage;
