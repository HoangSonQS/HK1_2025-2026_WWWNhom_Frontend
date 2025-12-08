import apiClient from '../../../services/apiClient';

const RETURN_API = '/return-requests';

export const returnRequestService = {
  create: async (payload) => {
    const res = await apiClient.post(RETURN_API, payload);
    return res.data;
  },
  getMy: async () => {
    const res = await apiClient.get(`${RETURN_API}/my`);
    return res.data;
  },
};

export default returnRequestService;

