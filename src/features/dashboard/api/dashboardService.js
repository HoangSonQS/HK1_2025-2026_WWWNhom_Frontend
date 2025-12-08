import adminApiClient from '../../../services/adminApiClient';

export const getDashboardSummary = () => {
  return adminApiClient.get('admin/statistics/summary');
};

export const getTopSellingProducts = () => {
  return adminApiClient.get('admin/statistics/top-products');
};


