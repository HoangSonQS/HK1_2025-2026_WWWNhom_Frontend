import staffApiClient from '../../../services/staffApiClient';

const STOCK_CHECK_API = '/stock-checks';

export const staffStockCheckService = {
  compare: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await staffApiClient.post(`${STOCK_CHECK_API}/compare`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export default staffStockCheckService;

