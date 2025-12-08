import apiClient from '../../../services/apiClient';

export const getDashboardSummary = () => {
  return apiClient.get('admin/statistics/summary');
};

export const getTopSellingProducts = () => {
  return apiClient.get('admin/statistics/top-products');
};

export const getMonthlyStats = (months = 12, year) => {
  return apiClient.get('admin/statistics/monthly', {
    params: { months, year }
  });
};


