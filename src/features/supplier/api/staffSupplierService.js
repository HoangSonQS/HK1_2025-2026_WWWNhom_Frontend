import staffApiClient from '../../../services/staffApiClient';

const SUPPLIER_API = '/suppliers';

export const staffSupplierService = {
  getAllSuppliers: async () => {
    try {
      const response = await staffApiClient.get(SUPPLIER_API);
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers (staff):', error);
      throw error;
    }
  },

  createSupplier: async (payload) => {
    try {
      const response = await staffApiClient.post(SUPPLIER_API, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier (staff):', error);
      throw error;
    }
  },

  updateSupplier: async (id, payload) => {
    try {
      const response = await staffApiClient.put(`${SUPPLIER_API}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating supplier (staff):', error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      const response = await staffApiClient.delete(`${SUPPLIER_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier (staff):', error);
      throw error;
    }
  },
};

export default staffSupplierService;

