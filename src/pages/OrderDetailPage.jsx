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
  Input,
  Radio,
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
  updatePaymentMethod,
} from "../features/order/api/orderService";
import { returnRequestService } from "../features/returnRequest/api/returnRequestService";
import { getImageUrl } from "../utils/imageUtils";
import { ROUTES } from "../utils/constants";
import { createPayment } from "../features/payment/api/paymentService";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [switchingPayment, setSwitchingPayment] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CASH");

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

  const handleCreateReturn = async () => {
    if (!order) return;
    if (!returnReason.trim()) {
      message.warning("Vui lòng nhập lý do trả hàng");
      return;
    }
    setReturnSubmitting(true);
    try {
      await returnRequestService.create({
        orderId: order.id,
        reason: returnReason.trim(),
      });
      message.success("Đã gửi yêu cầu trả hàng");
      setReturnModalOpen(false);
      setReturnReason("");
      loadOrder();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Gửi yêu cầu thất bại";
      message.error(errMsg);
    } finally {
      setReturnSubmitting(false);
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
        return "Chờ xác nhận";
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
      case "UNPAID":
        return "Chưa thanh toán";
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

  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const response = await createPayment(order.id);
      const paymentUrl = response.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        message.error("Không lấy được liên kết thanh toán");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo liên kết thanh toán";
      message.error(msg);
    } finally {
      setPaying(false);
    }
  };

  const handleSwitchToCOD = async () => {
    if (!order) return;
    setSelectedPaymentMethod(order.paymentMethod || "CASH");
    setPaymentModalOpen(true);
  };

  const handleUpdatePaymentMethod = async () => {
    if (!order) return;
    setSwitchingPayment(true);
    try {
      const response = await updatePaymentMethod(order.id, selectedPaymentMethod);
      setOrder(response.data);
      message.success("Đã cập nhật phương thức thanh toán");
      setPaymentModalOpen(false);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật phương thức thanh toán";
      message.error(msg);
    } finally {
      setSwitchingPayment(false);
    }
  };

  // Hàm handleConfirmReceived đã bị xóa - Trạng thái đơn hàng chỉ được duyệt ở trang admin

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
              <Button onClick={() => navigate(-1)}>Quay lại</Button>
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
            onClick={() => navigate(-1)}
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
              {(order.status === "PENDING" || order.status === "UNPAID") && (
                <Button
                  danger
                  size="large"
                  onClick={handleCancelOrder}
                  loading={actionLoading}
                >
                  Hủy đơn
                </Button>
              )}
              {order.status === "UNPAID" && (
                <>
                  {order.paymentMethod === "VNPAY" && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={handlePayNow}
                      loading={paying}
                    >
                      Thanh toán
                    </Button>
                  )}
                  <Button
                    size="large"
                    onClick={handleSwitchToCOD}
                  >
                    Đổi phương thức thanh toán
                  </Button>
                </>
              )}
              {order.status === "COMPLETED" && (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setReturnModalOpen(true)}
                >
                  Yêu cầu trả hàng
                </Button>
              )}
              {/* Button "Đã nhận" đã bị xóa - Trạng thái đơn hàng chỉ được duyệt ở trang admin */}
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
        <ReturnRequestModal
          open={returnModalOpen}
          onCancel={() => setReturnModalOpen(false)}
          onSubmit={handleCreateReturn}
          loading={returnSubmitting}
          reason={returnReason}
          setReason={setReturnReason}
        />
        <PaymentMethodModal
          open={paymentModalOpen}
          onCancel={() => setPaymentModalOpen(false)}
          onSubmit={handleUpdatePaymentMethod}
          loading={switchingPayment}
          selected={selectedPaymentMethod}
          onChange={setSelectedPaymentMethod}
        />
      </Content>
    </Layout>
  );
};

// Modal Yêu cầu trả hàng
const ReturnRequestModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
  reason,
  setReason,
}) => (
  <Modal
    title="Yêu cầu trả hàng"
    open={open}
    onCancel={onCancel}
    onOk={onSubmit}
    okText="Gửi yêu cầu"
    confirmLoading={loading}
    destroyOnClose
  >
    <p>Vui lòng nhập lý do trả hàng. Đơn cần ở trạng thái ĐÃ HOÀN THÀNH.</p>
    <Input.TextArea
      rows={4}
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      placeholder="Mô tả lý do (hàng lỗi, thiếu, nhầm...)"
    />
  </Modal>
);

// Modal chọn phương thức thanh toán
const PaymentMethodModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
  selected,
  onChange,
}) => (
  <Modal
    title="Chọn phương thức thanh toán"
    open={open}
    onCancel={onCancel}
    onOk={onSubmit}
    confirmLoading={loading}
    okText="Lưu"
    cancelText="Hủy"
    destroyOnClose
  >
    <Radio.Group
      onChange={(e) => onChange(e.target.value)}
      value={selected}
      style={{ width: "100%" }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Radio value="CASH">Thanh toán khi nhận hàng (COD)</Radio>
        <Radio value="VNPAY">Thanh toán qua VNPay</Radio>
      </Space>
    </Radio.Group>
  </Modal>
);

export default OrderDetailPage;
