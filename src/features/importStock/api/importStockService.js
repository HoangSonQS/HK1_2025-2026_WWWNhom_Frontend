import apiClient from '../../../services/apiClient';

const IMPORT_STOCK_API = '/import-stocks';

export const importStockService = {
  /**
   * Lấy danh sách tất cả phiếu nhập kho
   */
  getAllImportStocks: async () => {
    try {
      const response = await apiClient.get(IMPORT_STOCK_API);
      return response.data;
    } catch (error) {
      console.error('Error fetching import stocks:', error);
      throw error;
    }
  },

  /**
   * Tạo phiếu nhập kho mới
   * @param {Object} importStockData - Dữ liệu phiếu nhập
   * @param {number} importStockData.supplierId - ID nhà cung cấp
   * @param {Array} importStockData.items - Danh sách sách nhập
   * @param {number} importStockData.items[].bookId - ID sách
   * @param {number} importStockData.items[].quantity - Số lượng
   * @param {number} importStockData.items[].importPrice - Giá nhập
   */
  createImportStock: async (importStockData) => {
    try {
      const response = await apiClient.post(IMPORT_STOCK_API, importStockData);
      return response.data;
    } catch (error) {
      console.error('Error creating import stock:', error);
      throw error;
    }
  }
};

export default importStockService;

