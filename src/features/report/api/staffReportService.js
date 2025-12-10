import staffApiClient from '../../../services/staffApiClient';

const BASE = '/admin/statistics';

export const staffReportService = {
  getRevenue: async (start, end) => {
    const res = await staffApiClient.get(`${BASE}/revenue`, { params: { start, end } });
    return res.data;
  },
  getStatusCounts: async (start, end) => {
    const res = await staffApiClient.get(`${BASE}/status-counts`, { params: { start, end } });
    return res.data;
  },
  getTopProducts: async () => {
    const res = await staffApiClient.get(`${BASE}/top-products`);
    return res.data;
  },
  getLowStock: async (threshold = 10) => {
    const res = await staffApiClient.get(`${BASE}/low-stock`, { params: { threshold } });
    return res.data;
  },
  getInventorySummary: async () => {
    const res = await staffApiClient.get(`${BASE}/inventory/summary`);
    return res.data;
  },
  getInventoryByCategory: async () => {
    const res = await staffApiClient.get(`${BASE}/inventory/categories`);
    return res.data;
  },
  getReturns: async (start, end) => {
    const res = await staffApiClient.get(`${BASE}/returns`, { params: { start, end } });
    return res.data;
  },
  getPromotionUsage: async () => {
    const res = await staffApiClient.get(`${BASE}/promotion-usage`);
    return res.data;
  },
  getPromotionTopCustomers: async () => {
    const res = await staffApiClient.get(`${BASE}/promotion-top-customers`);
    return res.data;
  },
};

export default staffReportService;

