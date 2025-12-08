import staffApiClient from '../../../services/staffApiClient';

const STOCK_REQUEST_API = '/stock-requests';

export const staffStockRequestService = {
  createRequest: async (payload) => {
    const response = await staffApiClient.post(STOCK_REQUEST_API, payload);
    return response.data;
  },
  getMyRequests: async () => {
    const response = await staffApiClient.get(`${STOCK_REQUEST_API}/my`);
    return response.data;
  },
  getAllRequests: async () => {
    const response = await staffApiClient.get(STOCK_REQUEST_API);
    return response.data;
  },
  approve: async (id, payload) => {
    const response = await staffApiClient.put(`${STOCK_REQUEST_API}/${id}/approve`, payload);
    return response.data;
  },
  reject: async (id, payload) => {
    const response = await staffApiClient.put(`${STOCK_REQUEST_API}/${id}/reject`, payload);
    return response.data;
  },
};

export default staffStockRequestService;

