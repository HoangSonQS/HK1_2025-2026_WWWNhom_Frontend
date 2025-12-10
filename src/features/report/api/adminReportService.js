import adminApiClient from '../../../services/adminApiClient';

const BASE = '/admin/statistics';

export const adminReportService = {
  getRevenue: async (start, end) => {
    const res = await adminApiClient.get(`${BASE}/revenue`, { params: { start, end } });
    return res.data;
  },
  getStatusCounts: async (start, end) => {
    const res = await adminApiClient.get(`${BASE}/status-counts`, { params: { start, end } });
    return res.data;
  },
  getTopProducts: async () => {
    const res = await adminApiClient.get(`${BASE}/top-products`);
    return res.data;
  },
  getLowStock: async (threshold = 10) => {
    const res = await adminApiClient.get(`${BASE}/low-stock`, { params: { threshold } });
    return res.data;
  },
  getInventorySummary: async () => {
    const res = await adminApiClient.get(`${BASE}/inventory/summary`);
    return res.data;
  },
  getInventoryByCategory: async () => {
    const res = await adminApiClient.get(`${BASE}/inventory/categories`);
    return res.data;
  },
  getReturns: async (start, end) => {
    const res = await adminApiClient.get(`${BASE}/returns`, { params: { start, end } });
    return res.data;
  },
  getPromotionUsage: async () => {
    const res = await adminApiClient.get(`${BASE}/promotion-usage`);
    return res.data;
  },
  getPromotionTopCustomers: async () => {
    const res = await adminApiClient.get(`${BASE}/promotion-top-customers`);
    return res.data;
  },
};

export default adminReportService;



