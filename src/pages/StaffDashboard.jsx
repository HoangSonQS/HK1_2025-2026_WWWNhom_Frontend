import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, message, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  BookOutlined,
  FolderOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  GiftOutlined,
  ShopOutlined,
  InboxOutlined,
  UndoOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FileSearchOutlined,
  SwapLeftOutlined,
  OrderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { checkSellerStaffRole, checkWarehouseStaffRole } from "../utils/jwt";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import { logout } from "../features/user/api/staffAuthService";
import StaffHeader from "../components/StaffHeader";
import "../styles/admin.css";

const { Sider, Content } = Layout;
const { Title } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isWarehouse, setIsWarehouse] = useState(false);

  useEffect(() => {
    // Double check: Kiểm tra staffToken và role Staff
    // ProtectedStaffRoute đã check ở route level, nhưng check thêm ở component level để đảm bảo
    const staffToken = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
    
    if (!staffToken) {
      console.log('❌ StaffDashboard: No staffToken found');
      message.error("Bạn không có quyền truy cập trang này");
      navigate(ROUTES.STAFF_LOGIN, { replace: true });
      return;
    }
    
    // Kiểm tra role Staff từ staffToken
    const sellerStaff = checkSellerStaffRole(true); // useStaffToken = true
    const warehouseStaff = checkWarehouseStaffRole(true); // useStaffToken = true
    
    if (!sellerStaff && !warehouseStaff) {
      console.log('❌ StaffDashboard: Not staff role');
      message.error("Bạn không có quyền truy cập trang này");
      navigate(ROUTES.STAFF_LOGIN, { replace: true });
      return;
    }
    
    setIsSeller(sellerStaff);
    setIsWarehouse(warehouseStaff);
    
    // Kiểm tra token có hợp lệ không (chưa hết hạn)
    try {
      const tokenParts = staffToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('❌ StaffDashboard: Token expired');
          localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          navigate(ROUTES.STAFF_LOGIN, { replace: true });
          return;
        }
      }
    } catch (error) {
      console.error('❌ StaffDashboard: Error validating token:', error);
      localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.STAFF_REFRESH_TOKEN);
      message.error("Token không hợp lệ. Vui lòng đăng nhập lại");
      navigate(ROUTES.STAFF_LOGIN, { replace: true });
      return;
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout(); // staffAuthService.logout
      navigate(ROUTES.STAFF_LOGIN);
      message.success("Đăng xuất thành công");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Menu items cho SELLER_STAFF
  const sellerMenuItems = [
    {
      key: "/staff/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/staff/dashboard"),
    },
    {
      key: "/staff/books",
      icon: <BookOutlined />,
      label: "Quản lý Sách",
      onClick: () => navigate("/staff/books"),
    },
    {
      key: "/staff/categories",
      icon: <FolderOutlined />,
      label: "Quản lý Thể loại",
      onClick: () => navigate("/staff/categories"),
    },
    {
      key: "/staff/orders",
      icon: <ShoppingOutlined />,
      label: "Quản lý Đơn hàng",
      onClick: () => navigate("/staff/orders"),
    },
    {
      key: '/staff/promotions',
      icon: <GiftOutlined />,
      label: 'Quản lý Khuyến mãi',
      onClick: () => navigate('/staff/promotions')
    },
    {
      key: '/staff/customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
      onClick: () => navigate('/staff/customers')
    },
    {
      key: '/staff/stock-requests',
      icon: <InboxOutlined />,
      label: 'Yêu cầu nhập kho',
      onClick: () => navigate('/staff/stock-requests')
    },
    {
      key: '/staff/return-requests',
      icon: <UndoOutlined />,
      label: 'Yêu cầu hoàn/đổi',
      onClick: () => navigate('/staff/return-requests')
    },
    {
      key: '/staff/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      onClick: () => navigate('/staff/reports')
    },
    {
      key: '/staff/promotion-analytics',
      icon: <LineChartOutlined />,
      label: 'Promotion Analytics',
      onClick: () => navigate('/staff/promotion-analytics')
    },
    {
      key: '/staff/warehouse-returns',
      icon: <SwapLeftOutlined />,
      label: 'Trả về kho',
      onClick: () => navigate('/staff/warehouse-returns')
    },
  ];

  // Menu items cho WAREHOUSE_STAFF
  const warehouseMenuItems = [
    {
      key: "/staff/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/staff/dashboard"),
    },
    {
      key: "/staff/books",
      icon: <BookOutlined />,
      label: "Quản lý Sách",
      onClick: () => navigate("/staff/books"),
    },
    {
      key: "/staff/suppliers",
      icon: <ShopOutlined />,
      label: "Quản lý Nhà cung cấp",
      onClick: () => navigate("/staff/suppliers"),
    },
    {
      key: "/staff/import-stocks",
      icon: <InboxOutlined />,
      label: "Quản lý Phiếu nhập kho",
      onClick: () => navigate("/staff/import-stocks"),
    },
    {
      key: "/staff/stock-requests",
      icon: <InboxOutlined />,
      label: "Yêu cầu nhập kho",
      onClick: () => navigate("/staff/stock-requests"),
    },
    {
      key: '/staff/warehouse-returns',
      icon: <SwapLeftOutlined />,
      label: 'Trả về kho',
      onClick: () => navigate('/staff/warehouse-returns'),
    },
    {
      key: '/staff/stock-check',
      icon: <FileSearchOutlined />,
      label: 'Kiểm kê tồn kho',
      onClick: () => navigate('/staff/stock-check')
    },
    {
      key: '/staff/purchase-orders',
      icon: <OrderedListOutlined />,
      label: 'Đơn đặt hàng (PO)',
      onClick: () => navigate('/staff/purchase-orders')
    },
  ];

  // Chọn menu items dựa trên role
  const menuItems = isSeller ? sellerMenuItems : warehouseMenuItems;

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/staff" || path === "/staff/") return "/staff/dashboard";
    if (path.startsWith("/staff/books")) return "/staff/books";
    if (path.startsWith("/staff/categories")) return "/staff/categories";
    if (path.startsWith("/staff/orders")) return "/staff/orders";
    if (path.startsWith('/staff/promotions')) return '/staff/promotions';
    if (path.startsWith('/staff/customers')) return '/staff/customers';
    if (path.startsWith('/staff/stock-requests')) return '/staff/stock-requests';
    if (path.startsWith('/staff/return-requests')) return '/staff/return-requests';
    if (path.startsWith('/staff/reports')) return '/staff/reports';
    if (path.startsWith('/staff/promotion-analytics')) return '/staff/promotion-analytics';
    if (path.startsWith('/staff/warehouse-returns')) return '/staff/warehouse-returns';
    if (path.startsWith('/staff/stock-check')) return '/staff/stock-check';
    if (path.startsWith('/staff/purchase-orders')) return '/staff/purchase-orders';
    if (path.startsWith("/staff/suppliers")) return "/staff/suppliers";
    if (path.startsWith("/staff/import-stocks")) return "/staff/import-stocks";
    return "/staff/dashboard";
  };

  return (
    <Layout style={{ minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      <StaffHeader />
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
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              {collapsed ? "ST" : isSeller ? "SELLER" : "WAREHOUSE"}
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{ borderRight: 0, marginTop: 8, paddingBottom: 80 }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px",
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
              size="large"
              style={{
                height: 48,
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {!collapsed && "Đăng xuất"}
            </Button>
          </div>
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

export default StaffDashboard;

