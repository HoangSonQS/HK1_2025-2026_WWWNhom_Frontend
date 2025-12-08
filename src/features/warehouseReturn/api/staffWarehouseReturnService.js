import staffApiClient from '../../../services/staffApiClient';

const WR_API = '/warehouse-returns';

export const staffWarehouseReturnService = {
  create: async (payload) => {
    const res = await staffApiClient.post(WR_API, payload);
    return res.data;
  },
  getMy: async () => {
    const res = await staffApiClient.get(`${WR_API}/my`);
    return res.data;
  },
  getAll: async () => {
    const res = await staffApiClient.get(WR_API);
    return res.data;
  },
  approve: async (id, payload) => {
    const res = await staffApiClient.put(`${WR_API}/${id}/approve`, payload);
    return res.data;
  },
  reject: async (id, payload) => {
    const res = await staffApiClient.put(`${WR_API}/${id}/reject`, payload);
    return res.data;
  },
};

export default staffWarehouseReturnService;

