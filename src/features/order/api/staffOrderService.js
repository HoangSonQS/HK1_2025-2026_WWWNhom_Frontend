import staffApiClient from '../../../services/staffApiClient';

// Staff APIs - sử dụng staffApiClient với staffToken
export const getAllOrders = async () => {
  const response = await staffApiClient.get('/orders/all');
  return response;
};

export const getOrderById = async (orderId) => {
  const response = await staffApiClient.get(`/orders/${orderId}`);
  return response;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await staffApiClient.put(`/orders/${orderId}/status`, { status });
  return response;
};

