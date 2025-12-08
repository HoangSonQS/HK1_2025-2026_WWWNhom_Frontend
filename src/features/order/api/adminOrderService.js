import adminApiClient from '../../../services/adminApiClient';

/**
 * Admin Order Service - Sử dụng adminApiClient với adminToken
 * Chỉ dùng cho các trang admin
 */

export const getAllOrders = async () => {
  const response = await adminApiClient.get('/orders/all');
  return response;
};

export const getOrderById = async (orderId) => {
  const response = await adminApiClient.get(`/orders/${orderId}`);
  return response;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await adminApiClient.put(`/orders/${orderId}/status`, { status });
  return response;
};

