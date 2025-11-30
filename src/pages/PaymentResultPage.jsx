import React, { useMemo } from 'react';
import { Layout, Result, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { ROUTES } from '../utils/constants';

const { Content } = Layout;

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const status = queryParams.get('status');
  const orderId = queryParams.get('orderId');
  const message = queryParams.get('message');

  const isSuccess = status === 'success';

  return (
    <Layout className="cart-layout">
      <Header />
      <Content className="cart-content" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status={isSuccess ? 'success' : 'error'}
          title={isSuccess ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
          subTitle={
            <div>
              {message && <div style={{ marginBottom: 8 }}>{decodeURIComponent(message)}</div>}
              {orderId && (
                <div>
                  Mã đơn hàng: <strong>#{orderId}</strong>
                </div>
              )}
            </div>
          }
          extra={[
            <Button key="orders" type="primary" onClick={() => navigate(ROUTES.MY_ORDERS)}>
              Xem đơn hàng của tôi
            </Button>,
            <Button key="home" onClick={() => navigate(ROUTES.HOME)}>
              Tiếp tục mua sắm
            </Button>,
          ]}
        />
      </Content>
    </Layout>
  );
};

export default PaymentResultPage;

