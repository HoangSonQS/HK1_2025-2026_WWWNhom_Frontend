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
import { getAllOrders } from "../../features/order/api/staffOrderService";
import { ShoppingOutlined } from "@ant-design/icons";
import { ROUTES } from "../../utils/constants";

const { Title, Text } = Typography;

const StaffOrdersPage = () => {
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
      const data = response.data || [];
      setOrders(sortByDateDesc(data));
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem đơn hàng");
        navigate(ROUTES.STAFF_LOGIN, { replace: true });
      } else {
        message.error("Không thể tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sắp xếp mới nhất -> cũ nhất
  const sortByDateDesc = (list) =>
    [...list].sort(
      (a, b) =>
        new Date(b?.orderDate || b?.createdAt || 0) -
        new Date(a?.orderDate || a?.createdAt || 0)
    );

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredOrders = sortByDateDesc(orders).filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) =>
        record.customerInfo
          ? `${record.customerInfo.firstName} ${record.customerInfo.lastName}`
          : "N/A",
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => formatCurrency(amount),
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
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/staff/orders/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: "all",
      label: `Tất cả (${orders.length})`,
    },
    {
      key: "PENDING",
      label: `Chờ xác nhận (${orders.filter((o) => o.status === "PENDING").length})`,
    },
    {
      key: "PROCESSING",
      label: `Đang xử lý (${orders.filter((o) => o.status === "PROCESSING").length})`,
    },
    {
      key: "DELIVERING",
      label: `Đang giao (${orders.filter((o) => o.status === "DELIVERING").length})`,
    },
    {
      key: "COMPLETED",
      label: `Đã hoàn thành (${orders.filter((o) => o.status === "COMPLETED").length})`,
    },
    {
      key: "CANCELLED",
      label: `Đã hủy (${orders.filter((o) => o.status === "CANCELLED").length})`,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <Space>
          <ShoppingOutlined style={{ color: "#1890ff" }} />
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

        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center", padding: "50px" }} />
        ) : filteredOrders.length === 0 ? (
          <Empty description="Không có đơn hàng nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default StaffOrdersPage;

