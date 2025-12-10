import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Space,
  Avatar,
  Dropdown,
  Input,
  Badge,
  Popover,
  List,
  Typography,
  Empty,
  Spin,
  Tag,
  Modal,
  Divider,
} from "antd";
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  BellOutlined,
  CheckOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import { decodeJWT, isAdminOrStaff } from "../utils/jwt";
import { logout } from "../features/user/api/authService";
import { useCartCount } from "../hooks/useCartCount";
import { useNotificationCount } from "../hooks/useNotificationCount";
import {
  getMyNotifications,
  markAsRead,
} from "../features/notification/api/notificationService";
import "../styles/header.css";

const { Text } = Typography;

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [isAdminStaff, setIsAdminStaff] = React.useState(false);
  const { cartCount } = useCartCount();
  const { count: notificationCount, refresh: refreshNotificationCount } =
    useNotificationCount();
  const [notifications, setNotifications] = React.useState([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(false);
  const [notificationPopoverOpen, setNotificationPopoverOpen] =
    React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState(null);
  const [notificationModalVisible, setNotificationModalVisible] =
    React.useState(false);

  // Hàm để cập nhật user info từ jwtToken (chỉ đọc jwtToken, không đọc adminToken)
  const updateUserInfo = React.useCallback(() => {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN); // CHỈ đọc jwtToken
    if (token) {
      const decoded = decodeJWT(token, false); // useAdminToken = false
      if (decoded) {
        setUser(decoded);
        setIsAdminStaff(isAdminOrStaff());
      } else {
        setUser(null);
        setIsAdminStaff(false);
      }
    } else {
      setUser(null);
      setIsAdminStaff(false);
    }
  }, []);

  // Cập nhật user info khi component mount
  React.useEffect(() => {
    updateUserInfo();
  }, [updateUserInfo]);

  // Lắng nghe sự kiện khi jwtToken thay đổi (login/logout)
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      // Chỉ cập nhật khi jwtToken thay đổi, không quan tâm adminToken
      if (e.key === STORAGE_KEYS.JWT_TOKEN || e.key === null) {
        updateUserInfo();
      }
    };

    // Lắng nghe storage event (khi token thay đổi từ tab khác)
    window.addEventListener('storage', handleStorageChange);
    
    // Lắng nghe custom event (khi token thay đổi trong cùng tab)
    const handleTokenChange = () => {
      updateUserInfo();
    };
    window.addEventListener('jwtTokenChanged', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('jwtTokenChanged', handleTokenChange);
    };
  }, [updateUserInfo]);

  const [searchValue, setSearchValue] = useState("");

  const loadNotifications = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN); // CHỈ đọc jwtToken
    if (!token) return;

    setLoadingNotifications(true);
    try {
      const response = await getMyNotifications();
      // Chỉ lấy 5 thông báo gần nhất
      setNotifications((response.data || []).slice(0, 5));
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationVisibleChange = (open) => {
    setNotificationPopoverOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Cập nhật state ngay lập tức để UI phản hồi nhanh
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      await markAsRead(notificationId);
      // Reload notifications để đảm bảo dữ liệu chính xác từ server
      await loadNotifications();
      refreshNotificationCount();
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Nếu có lỗi, reload lại để đảm bảo state đúng
      await loadNotifications();
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

  const getNotificationIcon = (title) => {
    if (title?.includes("hủy") || title?.includes("Hủy")) {
      return (
        <ShoppingCartOutlined style={{ color: "#f5222d", fontSize: 20 }} />
      );
    }
    if (title?.includes("hoàn thành") || title?.includes("Hoàn thành")) {
      return <CheckOutlined style={{ color: "#52c41a", fontSize: 20 }} />;
    }
    if (title?.includes("cập nhật") || title?.includes("Cập nhật")) {
      return <BellOutlined style={{ color: "#1890ff", fontSize: 20 }} />;
    }
    return <BellOutlined style={{ color: "#722ed1", fontSize: 20 }} />;
  };

  // Extract orderId from notification title or content
  const extractOrderId = (title, content) => {
    const text = `${title} ${content || ""}`;
    // Tìm pattern như "Đơn hàng #1", "đơn hàng #1", "đơn hàng 1", "Đơn hàng 1"
    const match = text.match(/(?:đơn hàng|Đơn hàng)[\s#]*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const isPromotionNotification = (title = "", content = "") => {
    const normalizedTitle = title.toLowerCase();
    const normalizedContent = (content || "").toLowerCase();
    return (
      normalizedTitle.includes("khuyến mãi") ||
      normalizedTitle.includes("promotion") ||
      normalizedTitle.includes("mã giảm giá") ||
      normalizedTitle.includes("voucher") ||
      normalizedContent.includes("khuyến mãi") ||
      normalizedContent.includes("promotion") ||
      normalizedContent.includes("mã giảm giá") ||
      normalizedContent.includes("voucher")
    );
  };

  const notificationContent = (
    <div style={{ width: 360, maxHeight: 500 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid #f0f0f0",
          marginBottom: 8,
        }}
      >
        <Space>
          <BellOutlined style={{ color: "#1890ff" }} />
          <Text strong>Thông báo</Text>
        </Space>
        <Button
          type="link"
          size="small"
          onClick={() => {
            setNotificationPopoverOpen(false);
            navigate(ROUTES.NOTIFICATIONS);
          }}
        >
          Xem tất cả
        </Button>
      </div>
      {loadingNotifications ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          description="Không có thông báo"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "20px 0" }}
        />
      ) : (
        <List
          dataSource={notifications}
          style={{ maxHeight: 400, overflowY: "auto" }}
          renderItem={(item) => {
            const orderId = extractOrderId(item.title, item.content);
            return (
                <List.Item
                style={{
                  padding: "12px 0",
                  backgroundColor: "#fff",
                  border:
                    item.isRead === true
                      ? "1px solid #d9d9d9"
                      : "2px solid #ff4d4f",
                  paddingLeft: "12px",
                  marginBottom: 4,
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
                  setNotificationPopoverOpen(false);

                  // Nếu có orderId, chuyển đến chi tiết đơn hàng
                if (orderId) {
                  navigate(`/orders/${orderId}`);
                  return;
                }

                if (isPromotionNotification(item.title, item.content)) {
                  setNotificationPopoverOpen(false);
                  navigate(`${ROUTES.NOTIFICATIONS}?tab=promotions`);
                  return;
                }

                // Nếu không thuộc promotion, hiển thị modal chi tiết thông báo
                setSelectedNotification({ ...item, isRead: true });
                setNotificationModalVisible(true);
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
                  avatar={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: item.isRead ? "#f0f0f0" : "#fff1f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getNotificationIcon(item.title)}
                    </div>
                  }
                  title={
                    <Text
                      strong={item.isRead !== true}
                      style={{ fontSize: 14 }}
                      ellipsis
                    >
                      {item.title}
                    </Text>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={0}
                      style={{ width: "100%" }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {item.content}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
      setIsAdminStaff(false);
      // Dispatch event để các component khác biết jwtToken đã bị xóa
      window.dispatchEvent(new CustomEvent('jwtTokenChanged'));
      navigate(ROUTES.HOME);
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/books?search=${encodeURIComponent(value.trim())}`);
      setSearchValue("");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
      onClick: () => navigate(ROUTES.UPDATE_ACCOUNT),
    },
    {
      key: "my-orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng của tôi",
      onClick: () => navigate(ROUTES.MY_ORDERS),
    },
    {
      key: "change-password",
      icon: <SettingOutlined />,
      label: "Đổi mật khẩu",
      onClick: () => navigate(ROUTES.CHANGE_PASSWORD),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to={ROUTES.HOME}>Trang chủ</Link>,
    },
    {
      key: "books",
      icon: <BookOutlined />,
      label: <Link to="/books">Sách</Link>,
    },
  ];

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <Link to={ROUTES.HOME}>
            <span className="logo-text">SEBook</span>
          </Link>
        </div>

        <Menu
          mode="horizontal"
          items={menuItems}
          className="header-menu"
          selectedKeys={[]}
        />

        <div className="header-search">
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder="Tìm kiếm sách..."
              allowClear
              size="middle"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={(e) => handleSearch(e.target.value)}
              style={{ width: "100%" }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="middle"
              onClick={() => handleSearch(searchValue)}
            />
          </Space.Compact>
        </div>

        <div className="header-actions">
          {user && (
            <>
              <Badge
                count={cartCount}
                showZero={false}
                offset={[-9, 0]}
                size="small"
              >
                <Button
                  type="default"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => navigate(ROUTES.CART)}
                  className="cart-button"
                  style={{
                    marginRight: 8,
                    border: "1px solid #d9d9d9",
                    position: "relative",
                  }}
                />
              </Badge>
              <Popover
                content={notificationContent}
                title={null}
                trigger="hover"
                placement="bottomRight"
                open={notificationPopoverOpen}
                onOpenChange={handleNotificationVisibleChange}
                overlayStyle={{ padding: 0 }}
              >
                <Badge
                  count={notificationCount}
                  showZero={false}
                  offset={[-9, 0]}
                  size="small"
                >
                  <Button
                    type="default"
                    icon={<BellOutlined />}
                    onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                    className="notification-button"
                    style={{
                      marginRight: 8,
                      border: "1px solid #d9d9d9",
                      position: "relative",
                    }}
                  />
                </Badge>
              </Popover>
            </>
          )}
          {user ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span>{user.sub || user.username || "User"}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="default" onClick={() => navigate(ROUTES.LOGIN)}>
                Đăng nhập
              </Button>
              <Button
                type="primary"
                className="login-button"
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </div>
      </div>

      <Modal
        title={
          <Space>
            <BellOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết thông báo</span>
          </Space>
        }
        open={notificationModalVisible}
        onCancel={() => {
          setNotificationModalVisible(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setNotificationModalVisible(false);
              setSelectedNotification(null);
            }}
          >
            Đóng
          </Button>,
          <Button
            key="view-all"
            type="link"
            onClick={() => {
              setNotificationModalVisible(false);
              setSelectedNotification(null);
              navigate(ROUTES.NOTIFICATIONS);
            }}
          >
            Xem tất cả thông báo
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
                    setNotificationModalVisible(false);
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

    </AntHeader>
  );
};

export default Header;
