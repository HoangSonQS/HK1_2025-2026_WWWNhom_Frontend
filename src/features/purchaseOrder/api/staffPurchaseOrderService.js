import staffApiClient from '../../../services/staffApiClient';

const PO_API = '/purchase-orders';

export const staffPurchaseOrderService = {
  getAll: async () => {
    const res = await staffApiClient.get(PO_API);
    return res.data;
  },
  create: async (payload) => {
    const res = await staffApiClient.post(PO_API, payload);
    return res.data;
  },
  approve: async (id) => {
    const res = await staffApiClient.put(`${PO_API}/${id}/approve`);
    return res.data;
  },
  reject: async (id, note) => {
    const res = await staffApiClient.put(`${PO_API}/${id}/reject`, note || '');
    return res.data;
  },
};

export default staffPurchaseOrderService;

