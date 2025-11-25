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
import { ArrowLeftOutlined } from "@ant-design/icons";
import Header from "../components/Header";
import { getOrderById, cancelOrder, confirmReceived } from "../features/order/api/orderService";
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

          <Title level={2} style={{ marginBottom: 16, color: "#333" }}>
            CHI TIẾT ĐƠN HÀNG #{order.id}
          </Title>

          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Text type="secondary">Ngày đặt hàng:</Text>
                <Text strong style={{ marginLeft: 8 }}>
                  {formatDate(order.orderDate)}
                </Text>
              </div>
              <div>
                <Text type="secondary">Trạng thái:</Text>
                <Tag
                  color={getStatusColor(order.status)}
                  style={{ marginLeft: 8, fontSize: 14 }}
                >
                  {getStatusText(order.status)}
                </Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                {order.status === "PENDING" && (
                  <Button
                    danger
                    onClick={handleCancelOrder}
                    loading={actionLoading}
                    style={{ marginRight: 8 }}
                  >
                    Hủy đơn
                  </Button>
                )}
                {order.status === "DELIVERING" && (
                  <Button
                    type="primary"
                    onClick={handleConfirmReceived}
                    loading={actionLoading}
                  >
                    Đã nhận
                  </Button>
                )}
              </div>
            </Space>
          </Card>

          {order.customerInfo && (
            <Card title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <div>
                  <Text type="secondary">Họ tên:</Text>
                  <Text strong style={{ marginLeft: 8 }}>
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Email:</Text>
                  <Text strong style={{ marginLeft: 8 }}>
                    {order.customerInfo.email}
                  </Text>
                </div>
                {order.customerInfo.phoneNumber && (
                  <div>
                    <Text type="secondary">Số điện thoại:</Text>
                    <Text strong style={{ marginLeft: 8 }}>
                      {order.customerInfo.phoneNumber}
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {order.deliveryAddress && (
            <Card title="Địa chỉ giao hàng" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <div>
                  <Text strong>
                    {order.deliveryAddress.recipientName}
                  </Text>
                  {order.deliveryAddress.phoneNumber && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {order.deliveryAddress.phoneNumber}
                    </Text>
                  )}
                </div>
                <div>
                  <Text>
                    {order.deliveryAddress.street && `${order.deliveryAddress.street}, `}
                    {order.deliveryAddress.ward && `${order.deliveryAddress.ward}, `}
                    {order.deliveryAddress.district && `${order.deliveryAddress.district}, `}
                    {order.deliveryAddress.city}
                  </Text>
                </div>
              </Space>
            </Card>
          )}

          <Card title="Phương thức thanh toán" style={{ marginBottom: 16 }}>
            <Text strong>
              {order.paymentMethod === "CASH"
                ? "Thanh toán khi nhận hàng (COD)"
                : order.paymentMethod === "VNPAY"
                ? "Thanh toán qua VNPay"
                : order.paymentMethod || "Chưa xác định"}
            </Text>
          </Card>

          <Card title="Sản phẩm đã đặt" style={{ marginBottom: 16 }}>
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
                        style={{ fontSize: 16, cursor: "pointer" }}
                        onClick={() => navigate(`/books/${detail.bookId}`)}
                      >
                        {detail.bookTitle}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Số lượng: {detail.quantity} x{" "}
                        {detail.priceAtPurchase.toLocaleString("vi-VN")} đ
                      </Text>
                      <br />
                      <Text strong style={{ color: "#f5222d" }}>
                        {(detail.priceAtPurchase * detail.quantity).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Không có sản phẩm nào" />
            )}
          </Card>

          <Card title="Tóm tắt đơn hàng">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>Tạm tính:</Text>
                <Text>
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
                    }}
                  >
                    <Text type="secondary">
                      Mã khuyến mãi ({order.appliedPromotion.code}):
                    </Text>
                    <Text type="secondary" style={{ color: "#52c41a" }}>
                      -{order.discountAmount?.toLocaleString("vi-VN") || "0"} đ
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Giảm {order.appliedPromotion.discountPercent}%
                    </Text>
                  </div>
                </>
              )}
              <Divider style={{ margin: "8px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong>Tổng tiền:</Text>
                <Text strong style={{ fontSize: 20, color: "#f5222d" }}>
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

