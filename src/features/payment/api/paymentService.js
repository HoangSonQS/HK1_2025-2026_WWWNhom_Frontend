import apiClient from '../../../services/apiClient';

export const createVnPayPayment = (orderId) => {
  return apiClient.post('/payment/create-payment', { orderId });
};

