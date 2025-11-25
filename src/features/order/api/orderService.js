import apiClient from '../../../services/apiClient';

export const createOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData || {});
  return response;
};

export const getMyOrders = async () => {
  const response = await apiClient.get('/orders/my-orders');
  return response;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response;
};

export const cancelOrder = async (orderId) => {
  const response = await apiClient.put(`/orders/${orderId}/cancel`);
  return response;
};

export const confirmReceived = async (orderId) => {
  const response = await apiClient.put(`/orders/${orderId}/confirm-received`);
  return response;
};

