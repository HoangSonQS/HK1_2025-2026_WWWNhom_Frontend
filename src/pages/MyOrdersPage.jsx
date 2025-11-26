import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Typography,
  Tag,
  Empty,
  Table,
  Space,
  Button,
  Tabs,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getMyOrders,
  cancelOrder,
  confirmReceived,
} from "../features/order/api/orderService";
import { ROUTES } from "../utils/constants";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem đơn hàng");
        navigate(ROUTES.LOGIN);
      } else {
        message.error("Không thể tải danh sách đơn hàng");
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

  const getFilteredOrders = () => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === activeTab);
  };

  const getTabCount = (status) => {
    if (status === "all") {
      return orders.length;
    }
    return orders.filter((order) => order.status === status).length;
  };

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: `Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading((prev) => ({ ...prev, [orderId]: true }));
        try {
          const response = await cancelOrder(orderId);
          // Cập nhật order trong danh sách
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId ? response.data : order
            )
          );
          message.success("Đơn hàng đã được hủy thành công");
        } catch (error) {
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error("Không thể hủy đơn hàng");
          }
        } finally {
          setActionLoading((prev) => ({ ...prev, [orderId]: false }));
        }
      },
    });
  };

  const handleConfirmReceived = (orderId) => {
    Modal.confirm({
      title: "Xác nhận đã nhận hàng",
      content: `Bạn có chắc chắn đã nhận được đơn hàng #${orderId}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading((prev) => ({ ...prev, [orderId]: true }));
        try {
          const response = await confirmReceived(orderId);
          // Cập nhật order trong danh sách
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId ? response.data : order
            )
          );
          message.success("Đã xác nhận nhận hàng thành công");
        } catch (error) {
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else {
            message.error("Không thể xác nhận nhận hàng");
          }
        } finally {
          setActionLoading((prev) => ({ ...prev, [orderId]: false }));
        }
      },
    });
  };

  const tabItems = [
    {
      key: "all",
      label: `Tất cả (${getTabCount("all")})`,
    },
    {
      key: "PENDING",
      label: `Chờ xác nhận (${getTabCount("PENDING")})`,
    },
    {
      key: "PROCESSING",
      label: `Đang xử lý (${getTabCount("PROCESSING")})`,
    },
    {
      key: "DELIVERING",
      label: `Đang giao (${getTabCount("DELIVERING")})`,
    },
    {
      key: "COMPLETED",
      label: `Đã hoàn thành (${getTabCount("COMPLETED")})`,
    },
    {
      key: "CANCELLED",
      label: `Đã hủy (${getTabCount("CANCELLED")})`,
    },
    {
      key: "RETURNED",
      label: `Đã trả lại (${getTabCount("RETURNED")})`,
    },
  ];

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Số lượng sản phẩm",
      key: "itemCount",
      render: (_, record) => {
        const totalItems =
          record.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) ||
          0;
        return totalItems;
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Text strong style={{ color: "#f5222d" }}>
          {amount.toLocaleString("vi-VN")} đ
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Xem chi tiết",
      key: "view",
      align: "center",
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          Xem chi tiết
        </Button>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <>
          {record.status === "PENDING" && (
            <Button
              danger
              size="small"
              onClick={() => handleCancelOrder(record.id)}
              loading={actionLoading[record.id]}
            >
              Hủy đơn
            </Button>
          )}
          {record.status === "DELIVERING" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleConfirmReceived(record.id)}
              loading={actionLoading[record.id]}
            >
              Đã nhận
            </Button>
          )}
          {record.status !== "PENDING" && record.status !== "DELIVERING" && (
            <Text type="secondary">-</Text>
          )}
        </>
      ),
    },
  ];

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

  return (
    <Layout className="cart-layout">
      <Header />
      <Content className="cart-content">
        <div className="cart-container">
          <Title level={2} style={{ marginBottom: 16, color: "#333" }}>
            ĐƠN HÀNG CỦA TÔI
          </Title>

          {orders.length === 0 ? (
            <Card>
              <Empty description="Bạn chưa có đơn hàng nào" />
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
                  Mua sắm ngay
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={columns}
                dataSource={getFilteredOrders()}
                rowKey="id"
                locale={{
                  emptyText: "Chưa có đơn hàng nào",
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
                }}
              />
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default MyOrdersPage;
