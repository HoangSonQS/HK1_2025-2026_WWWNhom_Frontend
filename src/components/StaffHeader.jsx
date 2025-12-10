import React, { useState, useEffect } from "react";
import { Layout, Button, Dropdown, Avatar, Space, Typography, Tag } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import { decodeJWT, checkSellerStaffRole, checkWarehouseStaffRole } from "../utils/jwt";
import { logout } from "../features/user/api/staffAuthService";
import "../styles/admin.css";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const StaffHeader = () => {
  const navigate = useNavigate();
  const [staffInfo, setStaffInfo] = useState(null);
  const [staffType, setStaffType] = useState(''); // 'SELLER' hoặc 'WAREHOUSE'

  useEffect(() => {
    // Lấy thông tin staff từ staffToken
    const updateStaffInfo = () => {
      const staffToken = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
      if (staffToken) {
        const decoded = decodeJWT(staffToken, false, true); // useAdminToken = false, useStaffToken = true
        if (decoded) {
          setStaffInfo(decoded);
          
          // Xác định loại staff từ staffToken
          if (checkSellerStaffRole(true)) { // useStaffToken = true
            setStaffType('SELLER');
          } else if (checkWarehouseStaffRole(true)) { // useStaffToken = true
            setStaffType('WAREHOUSE');
          }
        }
      } else {
        setStaffInfo(null);
      }
    };

    updateStaffInfo();

    // Lắng nghe khi staffToken thay đổi
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.STAFF_TOKEN || e.key === null) {
        updateStaffInfo();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("staffTokenChanged", updateStaffInfo);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("staffTokenChanged", updateStaffInfo);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // staffAuthService.logout
      // Dispatch event để reset chatbox (nếu có)
      window.dispatchEvent(new CustomEvent("userLogout"));
      navigate(ROUTES.STAFF_LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleGoToPublic = () => {
    // Chuyển sang trang public (không logout staff)
    window.open(ROUTES.HOME, "_blank");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
      onClick: () => {
        console.log("Profile staff");
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

  const getStaffTypeText = () => {
    if (staffType === 'SELLER') {
      return 'Nhân viên Bán hàng';
    } else if (staffType === 'WAREHOUSE') {
      return 'Nhân viên Kho';
    }
    return 'Nhân viên';
  };

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
        onClick={() => navigate("/staff/dashboard")}
      >
        <Text
          strong
          style={{
            fontSize: "20px",
            color: "#1890ff",
            margin: 0,
          }}
        >
          SEBook {getStaffTypeText()}
        </Text>
      </div>

      {/* User Info & Actions */}
      <Space size="middle">
        {staffInfo && (
          <Space>
            <Text type="secondary">
              Xin chào, <Text strong>{staffInfo.sub || "Staff"}</Text>
            </Text>
            <Tag color={staffType === 'SELLER' ? 'blue' : 'orange'}>
              {getStaffTypeText()}
            </Tag>
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
            {staffInfo?.sub || "Staff"}
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default StaffHeader;

