import adminApiClient from '../../../services/adminApiClient';

const CUSTOMER_API = '/customers';

export const adminCustomerService = {
  getCustomers: async () => {
    const res = await adminApiClient.get(CUSTOMER_API);
    return res.data;
  },
  getCustomerDetail: async (id) => {
    const res = await adminApiClient.get(`${CUSTOMER_API}/${id}`);
    return res.data;
  },
};

export default adminCustomerService;

