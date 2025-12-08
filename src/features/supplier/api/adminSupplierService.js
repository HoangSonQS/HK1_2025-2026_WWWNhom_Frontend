import adminApiClient from '../../../services/adminApiClient';

const SUPPLIER_API = '/suppliers';

export const adminSupplierService = {
  /**
   * Lấy danh sách tất cả nhà cung cấp
   */
  getAllSuppliers: async () => {
    try {
      const response = await adminApiClient.get(SUPPLIER_API);
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  /**
   * Tạo nhà cung cấp mới
   * @param {Object} supplierData - Dữ liệu nhà cung cấp
   */
  createSupplier: async (supplierData) => {
    try {
      const response = await adminApiClient.post(SUPPLIER_API, supplierData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin nhà cung cấp
   * @param {number} id - ID nhà cung cấp
   * @param {Object} supplierData - Dữ liệu cập nhật
   */
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await adminApiClient.put(`${SUPPLIER_API}/${id}`, supplierData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  /**
   * Vô hiệu hóa nhà cung cấp (set isActive = false)
   * @param {number} id - ID nhà cung cấp
   */
  deactivateSupplier: async (id) => {
    try {
      const response = await adminApiClient.delete(`${SUPPLIER_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating supplier:', error);
      throw error;
    }
  }
};

export default adminSupplierService;


