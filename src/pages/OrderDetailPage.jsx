import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Typography,
  Tag,
  Empty,
  Button,
  Divider,
  Space,
  Modal,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  WalletOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import Header from "../components/Header";
import {
  getOrderById,
  cancelOrder,
  confirmReceived,
} from "../features/order/api/orderService";
import { getImageUrl } from "../utils/imageUtils";
import { ROUTES } from "../utils/constants";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id);
      console.log("Order data:", response.data);
      console.log("Payment method:", response.data?.paymentMethod);
      setOrder(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        navigate(ROUTES.LOGIN);
      } else if (error.response?.status === 403) {
        message.error("Bạn không có quyền xem đơn hàng này");
        navigate(ROUTES.MY_ORDERS);
      } else {
        message.error("Không thể tải chi tiết đơn hàng");
        navigate(ROUTES.MY_ORDERS);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "PROCESSING":
        return "blue";
      case "DELIVERING":
        return "cyan";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "RETURNED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "PROCESSING":
        return "Đang xử lý";
      case "DELIVERING":
        return "Đang giao";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "RETURNED":
        return "Đã trả lại";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = () => {
    if (!order) return;

    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: `Bạn có chắc chắn muốn hủy đơn hàng #${order.id}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await cancelOrder(order.id);
          setOrder(response.data);
          message.success("Đơn hàng đã được hủy thành công");
        } catch (error) {
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error("Không thể hủy đơn hàng");
          }
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleConfirmReceived = () => {
    if (!order) return;

    Modal.confirm({
      title: "Xác nhận đã nhận hàng",
      content: `Bạn có chắc chắn đã nhận được đơn hàng #${order.id}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await confirmReceived(order.id);
          setOrder(response.data);
          message.success("Đã xác nhận nhận hàng thành công");
        } catch (error) {
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error("Không thể xác nhận nhận hàng");
          }
        } finally {
          setActionLoading(false);
        }
      },
    });
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

  if (!order) {
    return (
      <Layout className="cart-layout">
        <Header />
        <Content className="cart-content">
          <div className="cart-container">
            <Empty description="Không tìm thấy đơn hàng" />
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button onClick={() => navigate(ROUTES.MY_ORDERS)}>
                Quay lại danh sách đơn hàng
              </Button>
            </div>
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
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.MY_ORDERS)}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title level={2} style={{ margin: 0, color: "#333" }}>
              CHI TIẾT ĐƠN HÀNG #{order.id}
            </Title>
            <Space>
              {order.status === "PENDING" && (
                <Button
                  danger
                  size="large"
                  onClick={handleCancelOrder}
                  loading={actionLoading}
                >
                  Hủy đơn
                </Button>
              )}
              {order.status === "DELIVERING" && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleConfirmReceived}
                  loading={actionLoading}
                >
                  Đã nhận
                </Button>
              )}
            </Space>
          </div>

          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Space>
                  <CalendarOutlined
                    style={{ fontSize: 16, color: "#1890ff" }}
                  />
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Ngày đặt hàng:
                  </Text>
                  <Text strong style={{ fontSize: 15 }}>
                    {formatDate(order.orderDate)}
                  </Text>
                </Space>
              </div>
              <div>
                <Space>
                  <TagOutlined style={{ fontSize: 16, color: "#52c41a" }} />
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Trạng thái:
                  </Text>
                  <Tag
                    color={getStatusColor(order.status)}
                    style={{ fontSize: 14, padding: "4px 12px" }}
                  >
                    {getStatusText(order.status)}
                  </Tag>
                </Space>
              </div>
            </Space>
          </Card>

          {order.customerInfo && (
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <span>Thông tin khách hàng</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div>
                  <Space>
                    <UserOutlined style={{ fontSize: 16, color: "#722ed1" }} />
                    <Text
                      type="secondary"
                      style={{ fontSize: 14, minWidth: 100 }}
                    >
                      Họ tên:
                    </Text>
                    <Text strong style={{ fontSize: 15 }}>
                      {order.customerInfo.firstName}{" "}
                      {order.customerInfo.lastName}
                    </Text>
                  </Space>
                </div>
                <div>
                  <Space>
                    <MailOutlined style={{ fontSize: 16, color: "#13c2c2" }} />
                    <Text
                      type="secondary"
                      style={{ fontSize: 14, minWidth: 100 }}
                    >
                      Email:
                    </Text>
                    <Text strong style={{ fontSize: 15 }}>
                      {order.customerInfo.email}
                    </Text>
                  </Space>
                </div>
                {order.customerInfo.phoneNumber && (
                  <div>
                    <Space>
                      <PhoneOutlined
                        style={{ fontSize: 16, color: "#52c41a" }}
                      />
                      <Text
                        type="secondary"
                        style={{ fontSize: 14, minWidth: 100 }}
                      >
                        Số điện thoại:
                      </Text>
                      <Text strong style={{ fontSize: 15 }}>
                        {order.customerInfo.phoneNumber}
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {order.deliveryAddress && (
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: "#f5222d" }} />
                  <span>Địa chỉ giao hàng</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                <div>
                  <Space>
                    <UserOutlined style={{ fontSize: 16, color: "#722ed1" }} />
                    <Text strong style={{ fontSize: 15 }}>
                      {order.deliveryAddress.recipientName}
                    </Text>
                    {order.deliveryAddress.phoneNumber && (
                      <>
                        <Text type="secondary">|</Text>
                        <PhoneOutlined
                          style={{ fontSize: 14, color: "#52c41a" }}
                        />
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          {order.deliveryAddress.phoneNumber}
                        </Text>
                      </>
                    )}
                  </Space>
                </div>
                <div>
                  <Space align="start">
                    <EnvironmentOutlined
                      style={{ fontSize: 16, color: "#f5222d", marginTop: 4 }}
                    />
                    <Text style={{ fontSize: 14, lineHeight: 1.8 }}>
                      {order.deliveryAddress.street &&
                        `${order.deliveryAddress.street}, `}
                      {order.deliveryAddress.ward &&
                        `${order.deliveryAddress.ward}, `}
                      {order.deliveryAddress.district &&
                        `${order.deliveryAddress.district}, `}
                      {order.deliveryAddress.city}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          )}

          <Card
            title={
              <Space>
                <CreditCardOutlined style={{ color: "#1890ff" }} />
                <span>Phương thức thanh toán</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Space size="middle">
              {order.paymentMethod === "CASH" ? (
                <>
                  <WalletOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                  <Text strong style={{ fontSize: 16 }}>
                    Thanh toán khi nhận hàng (COD)
                  </Text>
                  <Tag color="green">COD</Tag>
                </>
              ) : order.paymentMethod === "VNPAY" ? (
                <>
                  <CreditCardOutlined
                    style={{ fontSize: 20, color: "#1890ff" }}
                  />
                  <Text strong style={{ fontSize: 16 }}>
                    Thanh toán qua VNPay
                  </Text>
                  <Tag color="blue">VNPay</Tag>
                </>
              ) : order.paymentMethod ? (
                <>
                  <CreditCardOutlined style={{ fontSize: 20 }} />
                  <Text strong style={{ fontSize: 16 }}>
                    {order.paymentMethod}
                  </Text>
                </>
              ) : (
                <>
                  <CreditCardOutlined
                    style={{ fontSize: 20, color: "#d9d9d9" }}
                  />
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Chưa xác định
                  </Text>
                </>
              )}
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <ShoppingOutlined style={{ color: "#722ed1" }} />
                <span>Sản phẩm đã đặt</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {order.orderDetails && order.orderDetails.length > 0 ? (
              <div>
                {order.orderDetails.map((detail, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: "12px 0",
                      borderBottom:
                        index < order.orderDetails.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
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
                        src={getImageUrl(detail.bookImageUrl)}
                        alt={detail.bookTitle}
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
                      <Text
                        strong
                        style={{
                          fontSize: 16,
                          cursor: "pointer",
                          color: "#1890ff",
                        }}
                        onClick={() => navigate(`/books/${detail.bookId}`)}
                      >
                        {detail.bookTitle}
                      </Text>
                      <br />
                      <Space style={{ marginTop: 8 }} size="small">
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Số lượng:
                        </Text>
                        <Tag color="blue" style={{ fontSize: 12 }}>
                          {detail.quantity}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          x {detail.priceAtPurchase.toLocaleString("vi-VN")} đ
                        </Text>
                      </Space>
                      <br />
                      <Space style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Thành tiền:
                        </Text>
                        <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
                          {(
                            detail.priceAtPurchase * detail.quantity
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </Text>
                      </Space>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không có sản phẩm nào" />
            )}
          </Card>

          <Card
            title={
              <Space>
                <TagOutlined style={{ color: "#f5222d" }} />
                <span>Tóm tắt đơn hàng</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                }}
              >
                <Space>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Tạm tính:
                  </Text>
                </Space>
                <Text strong style={{ fontSize: 15 }}>
                  {order.subtotal?.toLocaleString("vi-VN") || "0"} đ
                </Text>
              </div>
              {order.appliedPromotion && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                    }}
                  >
                    <Space>
                      <TagOutlined style={{ fontSize: 14, color: "#52c41a" }} />
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        Mã khuyến mãi ({order.appliedPromotion.code}):
                      </Text>
                    </Space>
                    <Text strong style={{ color: "#52c41a", fontSize: 15 }}>
                      -{order.discountAmount?.toLocaleString("vi-VN") || "0"} đ
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "0 0 8px 0",
                    }}
                  >
                    <Tag color="green" style={{ fontSize: 12 }}>
                      Giảm {order.appliedPromotion.discountPercent}%
                    </Tag>
                  </div>
                </>
              )}
              <Divider style={{ margin: "8px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  background: "#f8f9fa",
                  margin: "-8px -16px",
                  padding: "12px 16px",
                  borderRadius: "4px",
                }}
              >
                <Space>
                  <Text strong style={{ fontSize: 16 }}>
                    Tổng tiền:
                  </Text>
                </Space>
                <Text strong style={{ fontSize: 22, color: "#f5222d" }}>
                  {order.totalAmount.toLocaleString("vi-VN")} đ
                </Text>
              </div>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default OrderDetailPage;
