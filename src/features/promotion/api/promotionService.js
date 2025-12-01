import apiClient from '../../../services/apiClient';

/**
 * Promotion Service - Tất cả các API calls liên quan đến khuyến mãi
 */

export const validatePromotionCode = async (code) => {
  const response = await apiClient.get(`/promotions/validate?code=${encodeURIComponent(code)}`);
  return response;
};

export const getAllPromotions = () => {
  return apiClient.get('promotions');
};

export const getPromotionById = (id) => {
  return apiClient.get(`promotions/${id}`);
};

export const createPromotion = (promotionData) => {
  return apiClient.post('promotions', promotionData, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export const approvePromotion = (id) => {
  return apiClient.put(`promotions/${id}/approve`, {}, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export const deactivatePromotion = (id) => {
  return apiClient.delete(`promotions/${id}`);
};

export const pausePromotion = (id) => {
  return apiClient.put(`promotions/${id}/pause`);
};

export const resumePromotion = (id) => {
  return apiClient.put(`promotions/${id}/resume`);
};

export const searchPromotions = (keyword) => {
  return apiClient.get('promotions/search', {
    params: { keyword }
  });
};

// Lấy danh sách khuyến mãi có log trong khoảng ngày
export const getPromotionsByLogDateRange = (startDate, endDate) => {
  return apiClient.get('promotion-logs/promotions-by-date-range', {
    params: {
      startDate,
      endDate,
    },
  });
};

// Lấy chi tiết nhật ký khuyến mãi theo khoảng ngày (dựa trên log_time)
export const getPromotionLogsByDateRange = (startDate, endDate) => {
  return apiClient.get('promotion-logs/date-range', {
    params: {
      startDate,
      endDate,
    },
  });
};


