import apiClient from '../../../services/apiClient';

export const getDashboardSummary = () => {
  return apiClient.get('admin/statistics/summary');
};

export const getTopSellingProducts = () => {
  return apiClient.get('admin/statistics/top-products');
};


