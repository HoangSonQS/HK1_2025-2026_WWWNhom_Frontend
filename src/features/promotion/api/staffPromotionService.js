import staffApiClient from '../../../services/staffApiClient';

/**
 * Staff Promotion Service - Tất cả các API calls liên quan đến khuyến mãi cho staff
 */

export const validatePromotionCode = async (code) => {
  const response = await staffApiClient.get(`promotions/validate?code=${encodeURIComponent(code)}`);
  return response;
};

export const getAllPromotions = () => {
  return staffApiClient.get('promotions');
};

export const getPromotionById = (id) => {
  return staffApiClient.get(`promotions/${id}`);
};

export const createPromotion = (promotionData) => {
  return staffApiClient.post('promotions', promotionData, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export const approvePromotion = (id) => {
  return staffApiClient.put(`promotions/${id}/approve`, {}, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export const deactivatePromotion = (id) => {
  return staffApiClient.delete(`promotions/${id}`);
};

export const pausePromotion = (id) => {
  return staffApiClient.put(`promotions/${id}/pause`);
};

export const resumePromotion = (id) => {
  return staffApiClient.put(`promotions/${id}/resume`);
};

export const searchPromotions = (keyword) => {
  return staffApiClient.get('promotions/search', {
    params: { keyword }
  });
};

// Lấy danh sách khuyến mãi có log trong khoảng ngày
export const getPromotionsByLogDateRange = (startDate, endDate) => {
  return staffApiClient.get('promotion-logs/promotions-by-date-range', {
    params: {
      startDate,
      endDate,
    },
  });
};

// Lấy chi tiết nhật ký khuyến mãi theo khoảng ngày (dựa trên log_time)
export const getPromotionLogsByDateRange = (startDate, endDate) => {
  return staffApiClient.get('promotion-logs/date-range', {
    params: {
      startDate,
      endDate,
    },
  });
};

