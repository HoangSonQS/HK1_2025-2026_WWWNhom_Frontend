import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Spin,
  message,
  Typography,
  Empty,
  Button,
  Space,
  List,
  Badge,
  Tag,
  Divider,
  Modal,
  Tabs,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../features/notification/api/notificationService";
import { ROUTES } from "../utils/constants";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await getMyNotifications();
      const notifications = response.data || [];
      // Debug: Log dữ liệu từ API
      console.log("Notifications from API:", notifications);
      notifications.forEach((notif, index) => {
        console.log(`Notification ${index + 1}:`, {
          id: notif.id,
          title: notif.title,
          isRead: notif.isRead,
          isReadType: typeof notif.isRead,
        });
      });
      setNotifications(notifications);
      // Trigger event để cập nhật count trong Header
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    } catch (error) {
      if (error.response?.status === 401) {
        message.warning("Vui lòng đăng nhập để xem thông báo");
        navigate(ROUTES.LOGIN);
      } else {
        message.error("Không thể tải thông báo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setActionLoading(true);
    try {
      const response = await markAsRead(notificationId);
      // Cập nhật state ngay lập tức để UI phản hồi nhanh
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      // Trigger event để cập nhật badge trong Header
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
      return response;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error("Không thể đánh dấu thông báo");
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    try {
      await markAllAsRead();
      await loadNotifications();
      message.success("Tất cả thông báo đã được đánh dấu là đã đọc");
      // Trigger event để cập nhật badge trong Header
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    } catch (error) {
      message.error("Không thể đánh dấu tất cả thông báo");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract orderId from notification title or content
  const extractOrderId = (title, content) => {
    const text = `${title} ${content || ""}`;
    // Tìm pattern như "Đơn hàng #1", "đơn hàng #1", "đơn hàng 1", "Đơn hàng 1"
    const match = text.match(/(?:đơn hàng|Đơn hàng)[\s#]*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Phân loại thông báo
  const isOrderNotification = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const content = notification.content?.toLowerCase() || "";
    return (
      title.includes("đơn hàng") ||
      title.includes("order") ||
      content.includes("đơn hàng") ||
      content.includes("order")
    );
  };

  const isPromotionNotification = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const content = notification.content?.toLowerCase() || "";
    return (
      title.includes("khuyến mãi") ||
      title.includes("promotion") ||
      title.includes("mã giảm giá") ||
      title.includes("voucher") ||
      content.includes("khuyến mãi") ||
      content.includes("promotion") ||
      content.includes("mã giảm giá") ||
      content.includes("voucher")
    );
  };

  const orderNotifications = notifications.filter(isOrderNotification);
  const promotionNotifications = notifications.filter(isPromotionNotification);
  const allNotifications = notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadOrderCount = orderNotifications.filter((n) => !n.isRead).length;
  const unreadPromotionCount = promotionNotifications.filter(
    (n) => !n.isRead
  ).length;

  // Component render danh sách thông báo
  const renderNotificationList = (notificationList) => {
    if (notificationList.length === 0) {
      return (
        <Empty
          description="Chưa có thông báo nào"
          style={{ padding: "40px 0" }}
        />
      );
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={notificationList}
        renderItem={(item) => {
          const orderId = extractOrderId(item.title, item.content);
          return (
            <List.Item
              style={{
                padding: "16px",
                backgroundColor: "#fff",
                border:
                  item.isRead === true
                    ? "1px solid #d9d9d9"
                    : "2px solid #ff4d4f",
                marginBottom: 8,
                borderRadius: 4,
                cursor: "pointer",
                position: "relative",
              }}
              onClick={async () => {
                // Đánh dấu đã đọc nếu chưa đọc
                if (item.isRead !== true) {
                  try {
                    await handleMarkAsRead(item.id);
                    // Cập nhật item trong state ngay lập tức
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === item.id ? { ...n, isRead: true } : n
                      )
                    );
                  } catch (error) {
                    console.error("Error marking as read:", error);
                  }
                }

                // Nếu có orderId, chuyển đến chi tiết đơn hàng
                if (orderId) {
                  navigate(`/orders/${orderId}`);
                } else {
                  // Nếu không có orderId, hiển thị modal chi tiết thông báo
                  // Cập nhật selectedNotification với isRead = true
                  setSelectedNotification({ ...item, isRead: true });
                  setModalVisible(true);
                }
              }}
            >
              {item.isRead !== true && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#ff4d4f",
                  }}
                />
              )}
              <List.Item.Meta
                title={
                  <Text strong={item.isRead !== true} style={{ fontSize: 16 }}>
                    {item.title}
                  </Text>
                }
                description={
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {item.content}
                    </Text>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatDate(item.createdAt)}
                      </Text>
                      {item.senderName && (
                        <>
                          <Text type="secondary">•</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Từ: {item.senderName}
                          </Text>
                        </>
                      )}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    );
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

  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`${ROUTES.NOTIFICATIONS}?tab=${key}`, { replace: true });
  };

  return (
    <Layout className="cart-layout">
      <Header />
      <Content className="cart-content">
        <div className="cart-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title level={2} style={{ margin: 0, color: "#333" }}>
              <Space>
                <BellOutlined style={{ color: "#1890ff" }} />
                <span>THÔNG BÁO</span>
              </Space>
            </Title>
            {unreadCount > 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAllAsRead}
                loading={actionLoading}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <Card>
              <Empty description="Bạn chưa có thông báo nào" />
            </Card>
          ) : (
            <Card>
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={[
                  {
                    key: "orders",
                    label: (
                      <Space>
                        <ShoppingOutlined />
                        <span>Đơn hàng</span>
                        {unreadOrderCount > 0 && (
                          <Badge count={unreadOrderCount} size="small" />
                        )}
                      </Space>
                    ),
                    children: renderNotificationList(orderNotifications),
                  },
                  {
                    key: "promotions",
                    label: (
                      <Space>
                        <GiftOutlined />
                        <span>Khuyến mãi</span>
                        {unreadPromotionCount > 0 && (
                          <Badge count={unreadPromotionCount} size="small" />
                        )}
                      </Space>
                    ),
                    children: renderNotificationList(promotionNotifications),
                  },
                ]}
              />
            </Card>
          )}
        </div>
      </Content>

      <Modal
        title={
          <Space>
            <BellOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết thông báo</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setModalVisible(false);
              setSelectedNotification(null);
            }}
          >
            Đóng
          </Button>,
          selectedNotification &&
            extractOrderId(
              selectedNotification.title,
              selectedNotification.content
            ) && (
              <Button
                key="view-order"
                type="primary"
                onClick={() => {
                  const orderId = extractOrderId(
                    selectedNotification.title,
                    selectedNotification.content
                  );
                  if (orderId) {
                    setModalVisible(false);
                    setSelectedNotification(null);
                    navigate(`/orders/${orderId}`);
                  }
                }}
              >
                Xem đơn hàng
              </Button>
            ),
        ].filter(Boolean)}
        width={600}
      >
        {selectedNotification && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ fontSize: 16 }}>
                {selectedNotification.title}
              </Text>
            </div>
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 14, whiteSpace: "pre-wrap" }}
              >
                {selectedNotification.content}
              </Text>
            </div>
            <Divider style={{ margin: "12px 0" }} />
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>Thời gian:</strong>{" "}
                {formatDate(selectedNotification.createdAt)}
              </Text>
              {selectedNotification.senderName && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Từ:</strong> {selectedNotification.senderName}
                </Text>
              )}
            </Space>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

export default NotificationsPage;
