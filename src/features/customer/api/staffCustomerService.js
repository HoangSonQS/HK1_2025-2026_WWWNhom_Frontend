import staffApiClient from '../../../services/staffApiClient';

const CUSTOMER_API = '/customers';

export const staffCustomerService = {
  getCustomers: async () => {
    const res = await staffApiClient.get(CUSTOMER_API);
    return res.data;
  },
  getCustomerDetail: async (id) => {
    const res = await staffApiClient.get(`${CUSTOMER_API}/${id}`);
    return res.data;
  },
};

export default staffCustomerService;

