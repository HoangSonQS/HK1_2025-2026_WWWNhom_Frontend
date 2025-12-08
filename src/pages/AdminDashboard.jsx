import React, { useState, useEffect } from "react";
import { Layout, Menu, Card, Typography, message } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  BookOutlined,
  FolderOutlined,
  UserOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  GiftOutlined,
  AppstoreOutlined,
  InboxOutlined,
  TeamOutlined,
  BarChartOutlined,
  UndoOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { checkAdminRole } from "../utils/jwt";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import AdminHeader from "../components/AdminHeader";
import "../styles/admin.css";

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Double check: Kiểm tra adminToken và role ADMIN
    // ProtectedAdminRoute đã check ở route level, nhưng check thêm ở component level để đảm bảo
    const adminToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    
    if (!adminToken) {
      console.log('❌ AdminDashboard: No adminToken found');
      message.error("Bạn không có quyền truy cập trang này");
      navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      return;
    }
    
    // Kiểm tra role ADMIN từ adminToken (useAdminToken = true)
    const isAdmin = checkAdminRole(true);
    if (!isAdmin) {
      console.log('❌ AdminDashboard: Not admin role');
      // Xóa token không hợp lệ
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
      message.error("Bạn không có quyền truy cập trang này");
      navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      return;
    }
    
    // Kiểm tra token có hợp lệ không (chưa hết hạn)
    try {
      const tokenParts = adminToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('❌ AdminDashboard: Token expired');
          localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          navigate(ROUTES.ADMIN_LOGIN, { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error validating token:', error);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN);
      message.error("Token không hợp lệ. Vui lòng đăng nhập lại");
      navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      return;
    }
  }, [navigate]);

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "/admin/books",
      icon: <BookOutlined />,
      label: "Quản lý Sách",
      onClick: () => navigate("/admin/books"),
    },
    {
      key: "/admin/categories",
      icon: <FolderOutlined />,
      label: "Quản lý Thể loại",
      onClick: () => navigate("/admin/categories"),
    },
    {
      key: "/admin/accounts",
      icon: <UserOutlined />,
      label: "Quản lý Tài khoản",
      onClick: () => navigate("/admin/accounts"),
    },
    {
      key: "/admin/orders",
      icon: <ShoppingOutlined />,
      label: "Quản lý Đơn hàng",
      onClick: () => navigate("/admin/orders"),
    },
    {
      key: '/admin/promotions',
      icon: <GiftOutlined />,
      label: 'Quản lý Khuyến mãi',
      onClick: () => navigate('/admin/promotions')
    },
    {
      key: "/admin/suppliers",
      icon: <ShopOutlined />,
      label: "Quản lý Nhà cung cấp",
      onClick: () => navigate("/admin/suppliers"),
    },
    {
      key: "/admin/import-stocks",
      icon: <InboxOutlined />,
      label: "Quản lý Phiếu nhập kho",
      onClick: () => navigate("/admin/import-stocks"),
    },
    {
      key: "/admin/customers",
      icon: <TeamOutlined />,
      label: "Quản lý Khách hàng",
      onClick: () => navigate("/admin/customers"),
    },
    {
      key: "/admin/return-requests",
      icon: <UndoOutlined />,
      label: "Yêu cầu Hoàn/Đổi",
      onClick: () => navigate("/admin/return-requests"),
    },
    {
      key: "/admin/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
      onClick: () => navigate("/admin/reports"),
    },
    {
      key: "/admin/promotion-analytics",
      icon: <FileSearchOutlined />,
      label: "Phân tích Khuyến mãi",
      onClick: () => navigate("/admin/promotion-analytics"),
    },
    {
      key: "/admin/stock-requests",
      icon: <ShoppingCartOutlined />,
      label: "Yêu cầu Nhập kho",
      onClick: () => navigate("/admin/stock-requests"),
    },
    {
      key: "/admin/stock-check",
      icon: <CheckCircleOutlined />,
      label: "Kiểm kê Tồn kho",
      onClick: () => navigate("/admin/stock-check"),
    },
    {
      key: "/admin/warehouse-returns",
      icon: <ReloadOutlined />,
      label: "Trả về Kho",
      onClick: () => navigate("/admin/warehouse-returns"),
    },
    {
      key: "/admin/purchase-orders",
      icon: <AppstoreOutlined />,
      label: "Đơn Đặt hàng",
      onClick: () => navigate("/admin/purchase-orders"),
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "/admin/dashboard";
    if (path.startsWith("/admin/books")) return "/admin/books";
    if (path.startsWith("/admin/categories")) return "/admin/categories";
    if (path.startsWith("/admin/accounts")) return "/admin/accounts";
    if (path.startsWith("/admin/orders")) return "/admin/orders";
    if (path.startsWith('/admin/promotions')) return '/admin/promotions';
    if (path.startsWith("/admin/suppliers")) return "/admin/suppliers";
    if (path.startsWith("/admin/import-stocks")) return "/admin/import-stocks";
    if (path.startsWith("/admin/customers")) return "/admin/customers";
    if (path.startsWith("/admin/return-requests")) return "/admin/return-requests";
    if (path.startsWith("/admin/reports")) return "/admin/reports";
    if (path.startsWith("/admin/promotion-analytics")) return "/admin/promotion-analytics";
    if (path.startsWith("/admin/stock-requests")) return "/admin/stock-requests";
    if (path.startsWith("/admin/stock-check")) return "/admin/stock-check";
    if (path.startsWith("/admin/warehouse-returns")) return "/admin/warehouse-returns";
    if (path.startsWith("/admin/purchase-orders")) return "/admin/purchase-orders";
    return "/admin/dashboard";
  };

  return (
    <Layout style={{ minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      <AdminHeader />
      <Layout style={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={250}
          trigger={null}
          className="admin-sider"
          style={{
            background: "#fff",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            position: "relative",
            height: "100%",
            overflow: "auto",
            scrollbarWidth: "none", /* Firefox */
            msOverflowStyle: "none", /* IE và Edge */
          }}
        >
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Title level={4} style={{ margin: 0, color: "#ff6b35" }}>
              {collapsed ? "AD" : "ADMIN"}
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{ borderRight: 0, marginTop: 8 }}
          />
        </Sider>
        <Layout style={{ padding: "24px", overflow: "auto", height: "100%" }}>
          <Content
            style={{
              background: "#fff",
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: 8,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
