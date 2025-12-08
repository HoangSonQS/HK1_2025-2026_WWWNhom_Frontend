import staffApiClient from '../../../services/staffApiClient';

const IMPORT_STOCK_API = '/import-stocks';

export const staffImportStockService = {
  /**
   * Tạo phiếu nhập kho (Warehouse Staff)
   */
  createImportStock: async (payload) => {
    try {
      const response = await staffApiClient.post(IMPORT_STOCK_API, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating import stock:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu nhập kho
   */
  getAllImportStocks: async () => {
    try {
      const response = await staffApiClient.get(IMPORT_STOCK_API);
      return response.data;
    } catch (error) {
      console.error('Error fetching import stocks:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử nhập kho của một cuốn sách
   * @param {number} bookId - ID sách
   */
  getImportHistoryByBookId: async (bookId) => {
    try {
      const response = await staffApiClient.get(`${IMPORT_STOCK_API}/books/${bookId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching import history:', error);
      throw error;
    }
  }
};

export default staffImportStockService;
