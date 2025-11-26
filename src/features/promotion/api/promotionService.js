import apiClient from '../../../services/apiClient';

export const validatePromotionCode = async (code) => {
  const response = await apiClient.get(`/promotions/validate?code=${encodeURIComponent(code)}`);
  return response;
};

