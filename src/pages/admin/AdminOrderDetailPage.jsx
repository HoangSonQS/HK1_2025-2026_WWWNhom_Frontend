import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  message,
  Typography,
  Tag,
  Button,
  Divider,
  Space,
  Modal,
  Select,
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
  EditOutlined,
} from "@ant-design/icons";
import {
  getOrderById,
  updateOrderStatus,
} from "../../features/order/api/orderService";
import { getImageUrl } from "../../utils/imageUtils";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id);
      setOrder(response.data);
      setSelectedStatus(response.data?.status || "");
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        navigate("/admin/login");
      } else {
        message.error("Không thể tải chi tiết đơn hàng");
        navigate("/admin/orders");
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleUpdateStatus = () => {
    if (!order || !selectedStatus) return;

    // Kiểm tra nếu đơn đã bị hủy, đã hoàn thành hoặc đã trả lại
    if (order.status === "CANCELLED") {
      message.warning("Không thể cập nhật trạng thái đơn hàng đã bị hủy");
      setStatusModalVisible(false);
      return;
    }
    if (order.status === "COMPLETED") {
      message.warning("Không thể cập nhật trạng thái đơn hàng đã hoàn thành");
      setStatusModalVisible(false);
      return;
    }
    if (order.status === "RETURNED") {
      message.warning("Không thể cập nhật trạng thái đơn hàng đã trả lại");
      setStatusModalVisible(false);
      return;
    }

    Modal.confirm({
      title: "Xác nhận thay đổi trạng thái",
      content: `Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng #${order.id} từ "${getStatusText(order.status)}" sang "${getStatusText(selectedStatus)}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await updateOrderStatus(order.id, selectedStatus);
          setOrder(response.data);
          setStatusModalVisible(false);
          message.success("Trạng thái đơn hàng đã được cập nhật thành công");
          // Trigger event để cập nhật notification count
          window.dispatchEvent(new CustomEvent("notificationUpdated"));
        } catch (error) {
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error("Không thể cập nhật trạng thái đơn hàng");
          }
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", textAlign: "center", padding: "50px" }}
      />
    );
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  return (
    <div>
      <Space style={{ marginBottom: 24, width: "100%", justifyContent: "space-between" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedStatus(order.status);
            setStatusModalVisible(true);
          }}
          disabled={
            order.status === "CANCELLED" ||
            order.status === "COMPLETED" ||
            order.status === "RETURNED"
          }
        >
          Chỉnh sửa trạng thái
        </Button>
      </Space>

      <Title level={2} style={{ marginBottom: 24 }}>
        <Space>
          <ShoppingOutlined style={{ color: "#ff6b35" }} />
          <span>Chi tiết đơn hàng #{order.id}</span>
          <Tag color={getStatusColor(order.status)} style={{ fontSize: 14, padding: "4px 12px" }}>
            {getStatusText(order.status)}
          </Tag>
        </Space>
      </Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Chi tiết sản phẩm */}
        <Card
          title={
            <Space>
              <ShoppingOutlined />
              <span>Sản phẩm</span>
            </Space>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {order.orderDetails?.map((detail, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 16,
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                }}
              >
                <img
                  src={getImageUrl(detail.bookImageUrl)}
                  alt={detail.bookTitle}
                  style={{
                    width: 80,
                    height: 100,
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                    borderRadius: 4,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {detail.bookTitle}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Số lượng: </Text>
                    <Text strong>{detail.quantity}</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">Giá: </Text>
                    <Text strong style={{ color: "#ff6b35" }}>
                      {formatCurrency(detail.priceAtPurchase)}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">Thành tiền: </Text>
                    <Text strong style={{ color: "#ff6b35", fontSize: 16 }}>
                      {formatCurrency(detail.priceAtPurchase * detail.quantity)}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </Space>
        </Card>

        {/* Thông tin khách hàng */}
        <Card
          title={
            <Space>
              <UserOutlined />
              <span>Thông tin khách hàng</span>
            </Space>
          }
        >
          {order.customerInfo ? (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <Text strong>
                  {order.customerInfo.firstName} {order.customerInfo.lastName}
                </Text>
              </Space>
              <Space>
                <MailOutlined style={{ color: "#1890ff" }} />
                <Text>{order.customerInfo.email}</Text>
              </Space>
              {order.customerInfo.phoneNumber && (
                <Space>
                  <PhoneOutlined style={{ color: "#1890ff" }} />
                  <Text>{order.customerInfo.phoneNumber}</Text>
                </Space>
              )}
            </Space>
          ) : (
            <Text type="secondary">Chưa có thông tin khách hàng</Text>
          )}
        </Card>

        {/* Địa chỉ giao hàng */}
        {order.deliveryAddress && (
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                <span>Địa chỉ giao hàng</span>
              </Space>
            }
          >
            <Space direction="vertical" size="small">
              <Text>
                {order.deliveryAddress.street}, {order.deliveryAddress.ward},{" "}
                {order.deliveryAddress.district}, {order.deliveryAddress.city}
              </Text>
            </Space>
          </Card>
        )}

        {/* Phương thức thanh toán */}
        <Card
          title={
            <Space>
              <CreditCardOutlined />
              <span>Phương thức thanh toán</span>
            </Space>
          }
        >
          <Space>
            {order.paymentMethod === "VNPAY" ? (
              <WalletOutlined style={{ color: "#1890ff", fontSize: 20 }} />
            ) : (
              <CreditCardOutlined style={{ color: "#52c41a", fontSize: 20 }} />
            )}
            <Tag
              color={order.paymentMethod === "VNPAY" ? "blue" : "green"}
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              {order.paymentMethod === "VNPAY" ? "VNPay" : "Thanh toán khi nhận hàng"}
            </Tag>
          </Space>
        </Card>

        {/* Tóm tắt đơn hàng */}
        <Card
          title={
            <Space>
              <TagOutlined />
              <span>Tóm tắt đơn hàng</span>
            </Space>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text>Tạm tính:</Text>
              <Text>{formatCurrency(order.subtotal || order.totalAmount)}</Text>
            </div>
            {order.appliedPromotion && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text>
                  Khuyến mãi ({order.appliedPromotion.name}):{" "}
                  <Tag color="green">-{order.appliedPromotion.discountPercent}%</Tag>
                </Text>
                <Text type="success">
                  -{formatCurrency(order.discountAmount || 0)}
                </Text>
              </div>
            )}
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong style={{ fontSize: 18 }}>
                Tổng cộng:
              </Text>
              <Text strong style={{ fontSize: 18, color: "#ff6b35" }}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary">
                  Ngày đặt: {formatDate(order.orderDate)}
                </Text>
              </Space>
            </div>
          </Space>
        </Card>
      </Space>

      {/* Modal chỉnh sửa trạng thái */}
      <Modal
        title="Chỉnh sửa trạng thái đơn hàng"
        open={statusModalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedStatus(order.status);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Trạng thái hiện tại: </Text>
            <Tag color={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Tag>
          </div>
          {order.status === "CANCELLED" ||
          order.status === "COMPLETED" ||
          order.status === "RETURNED" ? (
            <Text type="danger" style={{ fontSize: 14 }}>
              ⚠️ Không thể cập nhật trạng thái đơn hàng{" "}
              {order.status === "CANCELLED"
                ? "đã bị hủy"
                : order.status === "COMPLETED"
                ? "đã hoàn thành"
                : "đã trả lại"}
            </Text>
          ) : (
            <>
              <div>
                <Text strong>Trạng thái mới: </Text>
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  <Option value="PENDING">Chờ xác nhận</Option>
                  <Option value="PROCESSING">Đang xử lý</Option>
                  <Option value="DELIVERING">Đang giao</Option>
                  <Option value="COMPLETED">Đã hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                  <Option value="RETURNED">Đã trả lại</Option>
                </Select>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Lưu ý: Khi thay đổi trạng thái, thông báo sẽ được gửi đến khách hàng.
              </Text>
            </>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default AdminOrderDetailPage;

