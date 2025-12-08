import adminApiClient from '../../../services/adminApiClient';

const PROMOTION_API = '/promotions';

export const adminPromotionService = {
  getById: async (id) => {
    const res = await adminApiClient.get(`${PROMOTION_API}/${id}`);
    return res.data;
  },
  getAll: async () => {
    const res = await adminApiClient.get(PROMOTION_API);
    return res.data;
  },
  create: async (payload) => {
    const res = await adminApiClient.post(PROMOTION_API, payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await adminApiClient.put(`${PROMOTION_API}/${id}`, payload);
    return res.data;
  },
  approve: async (id) => {
    const res = await adminApiClient.put(`${PROMOTION_API}/${id}/approve`);
    return res.data;
  },
  pause: async (id) => {
    const res = await adminApiClient.put(`${PROMOTION_API}/${id}/pause`);
    return res.data;
  },
  resume: async (id) => {
    const res = await adminApiClient.put(`${PROMOTION_API}/${id}/resume`);
    return res.data;
  },
  deactivate: async (id) => {
    const res = await adminApiClient.put(`${PROMOTION_API}/${id}/deactivate`);
    return res.data;
  },
  delete: async (id) => {
    const res = await adminApiClient.delete(`${PROMOTION_API}/${id}`);
    return res.data;
  },
};

export default adminPromotionService;

