import staffApiClient from '../../../services/staffApiClient';

const RETURN_API = '/return-requests';

export const staffReturnRequestService = {
  getAll: async () => {
    const res = await staffApiClient.get(RETURN_API);
    return res.data;
  },
  approve: async (id, payload) => {
    const res = await staffApiClient.put(`${RETURN_API}/${id}/approve`, payload);
    return res.data;
  },
  reject: async (id, payload) => {
    const res = await staffApiClient.put(`${RETURN_API}/${id}/reject`, payload);
    return res.data;
  },
};

export default staffReturnRequestService;

