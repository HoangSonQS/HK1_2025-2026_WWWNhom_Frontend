import staffApiClient from '../../../services/staffApiClient';

export const getDashboardSummary = () => {
  return staffApiClient.get('admin/statistics/summary');
};

export const getTopSellingProducts = () => {
  return staffApiClient.get('admin/statistics/top-products');
};

export const getWarehouseSummary = () => {
  return staffApiClient.get('admin/statistics/warehouse-summary');
};

