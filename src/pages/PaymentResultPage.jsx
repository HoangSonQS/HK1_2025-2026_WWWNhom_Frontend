import React, { useEffect } from "react";
import { Layout, Card, Button, Result, Spin, Typography } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Header from "../components/Header";
import { ROUTES } from "../utils/constants";
import "../styles/cart.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status"); // "success" hoặc "failed"
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  useEffect(() => {
    // Trigger event để cập nhật cart count và notification count
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    window.dispatchEvent(new CustomEvent("notificationUpdated"));
  }, []);

  const isSuccess = status === "success";

  return (
    <Layout className="cart-layout">
      <Header />
      <Content className="cart-content">
        <div className="cart-container" style={{ maxWidth: 600, margin: "0 auto" }}>
          <Card>
            <Result
              status={isSuccess ? "success" : "error"}
              icon={
                isSuccess ? (
                  <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 72 }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 72 }} />
                )
              }
              title={
                isSuccess
                  ? "Thanh toán thành công!"
                  : "Thanh toán thất bại"
              }
              subTitle={
                message || 
                (isSuccess
                  ? "Đơn hàng của bạn đã được thanh toán thành công và đang được xử lý."
                  : "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.")
              }
              extra={[
                orderId && (
                  <Button
                    type="primary"
                    key="view-order"
                    onClick={() => navigate(`/orders/${orderId}`)}
                  >
                    Xem đơn hàng
                  </Button>
                ),
                <Button
                  key="my-orders"
                  onClick={() => navigate(ROUTES.MY_ORDERS)}
                >
                  Đơn hàng của tôi
                </Button>,
                <Button
                  key="home"
                  onClick={() => navigate(ROUTES.HOME)}
                >
                  Về trang chủ
                </Button>,
              ]}
            />
            {orderId && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text type="secondary">
                  Mã đơn hàng: <Text strong>#{orderId}</Text>
                </Text>
              </div>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default PaymentResultPage;

