import React, { useState, useEffect } from "react";
import { Layout, Button, Dropdown, Avatar, Space, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import { decodeJWT } from "../utils/jwt";
import { logout } from "../features/user/api/adminAuthService";
import "../styles/admin.css";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Lấy thông tin admin từ adminToken
    const updateAdminInfo = () => {
      const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (adminToken) {
        const decoded = decodeJWT(adminToken, true); // useAdminToken = true
        if (decoded) {
          setAdminInfo(decoded);
        }
      } else {
        setAdminInfo(null);
      }
    };

    updateAdminInfo();

    // Lắng nghe khi adminToken thay đổi
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.ADMIN_TOKEN || e.key === null) {
        updateAdminInfo();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("adminTokenChanged", updateAdminInfo);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("adminTokenChanged", updateAdminInfo);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Dispatch event để các component khác biết adminToken đã bị xóa
      window.dispatchEvent(new CustomEvent("adminTokenChanged"));
      navigate(ROUTES.ADMIN_LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleGoToPublic = () => {
    // Chuyển sang trang public (không logout admin)
    window.open(ROUTES.HOME, "_blank");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
      onClick: () => {
        // Có thể navigate đến trang profile admin nếu có
        console.log("Profile admin");
      },
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => {
        console.log("Settings");
      },
    },
    {
      type: "divider",
    },
    {
      key: "public",
      icon: <HomeOutlined />,
      label: "Về trang chủ",
      onClick: handleGoToPublic,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo/Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => navigate("/admin/dashboard")}
      >
        <Text
          strong
          style={{
            fontSize: "20px",
            color: "#ff6b35",
            margin: 0,
          }}
        >
          SEBook Admin
        </Text>
      </div>

      {/* User Info & Actions */}
      <Space size="middle">
        {adminInfo && (
          <Space>
            <Text type="secondary">
              Xin chào, <Text strong>{adminInfo.sub || "Admin"}</Text>
            </Text>
          </Space>
        )}

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<Avatar icon={<UserOutlined />} size="small" />}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {adminInfo?.sub || "Admin"}
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default AdminHeader;

