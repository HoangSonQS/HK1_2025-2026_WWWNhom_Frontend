import React, { useState, useEffect } from "react";
import {
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
} from "antd";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../features/order/api/adminOrderService";
import { ShoppingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem đơn hàng");
        navigate("/admin/login");
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lọc đơn hàng theo trạng thái
  const getFilteredOrders = () => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === activeTab);
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 200,
      render: (_, record) => {
        const customerInfo = record.customerInfo;
        if (!customerInfo) return "-";
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {customerInfo.firstName} {customerInfo.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {customerInfo.email}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 150,
      render: (date) => formatDate(date),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <Text strong style={{ color: "#ff6b35" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => navigate(`/admin/orders/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const filteredOrders = getFilteredOrders();

  const tabItems = [
    {
      key: "all",
      label: `Tất cả (${orders.length})`,
    },
    {
      key: "PENDING",
      label: `Chờ xác nhận (${
        orders.filter((o) => o.status === "PENDING").length
      })`,
    },
    {
      key: "PROCESSING",
      label: `Đang xử lý (${
        orders.filter((o) => o.status === "PROCESSING").length
      })`,
    },
    {
      key: "DELIVERING",
      label: `Đang giao (${
        orders.filter((o) => o.status === "DELIVERING").length
      })`,
    },
    {
      key: "COMPLETED",
      label: `Đã hoàn thành (${
        orders.filter((o) => o.status === "COMPLETED").length
      })`,
    },
    {
      key: "CANCELLED",
      label: `Đã hủy (${
        orders.filter((o) => o.status === "CANCELLED").length
      })`,
    },
    {
      key: "RETURNED",
      label: `Đã trả lại (${
        orders.filter((o) => o.status === "RETURNED").length
      })`,
    },
  ];

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", textAlign: "center", padding: "50px" }}
      />
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <Space>
          <ShoppingOutlined style={{ color: "#ff6b35" }} />
          <span>Quản lý Đơn hàng</span>
        </Space>
      </Title>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {filteredOrders.length === 0 ? (
          <Empty description="Chưa có đơn hàng nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminOrdersPage;

