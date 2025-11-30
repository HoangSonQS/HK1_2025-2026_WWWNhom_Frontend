import apiClient from '../../../services/apiClient';

/**
 * Tạo URL thanh toán VNPay cho đơn hàng
 * @param {number} orderId - ID của đơn hàng
 * @returns {Promise} Response chứa paymentUrl
 */
export const createPayment = async (orderId) => {
  const response = await apiClient.post('/payment/create-payment', {
    orderId: orderId
  });
  return response;
};

