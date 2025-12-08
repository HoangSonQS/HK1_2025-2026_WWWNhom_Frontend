import client from '../../../services/apiClient';

/**
 * AI Service - Xử lý các API liên quan đến AI
 */

/**
 * Tìm kiếm sách thông minh bằng semantic search
 * @param {string} query - Câu truy vấn tìm kiếm
 * @param {number} limit - Số lượng kết quả tối đa (mặc định 10)
 * @returns {Promise<Array>} Danh sách sách được sắp xếp theo độ liên quan
 */
export const searchBooks = async (query, limit = 10) => {
    try {
        const response = await client.get('/ai/search', {
            params: {
                q: query,
                limit: limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Lỗi khi tìm kiếm sách:', error);
        throw error;
    }
};

/**
 * Chat với AI chatbot
 * @param {string} message - Tin nhắn từ người dùng
 * @param {string} conversationId - ID cuộc hội thoại (optional)
 * @returns {Promise<Object>} ChatResponse với câu trả lời từ AI
 */
export const chatWithAI = async (message, conversationId = null) => {
    try {
        const response = await client.post('/ai/chat', {
            message: message,
            conversationId: conversationId
        });
        return response.data;
    } catch (error) {
        console.error('❌ Lỗi khi chat với AI:', error);
        throw error;
    }
};

export default {
    searchBooks,
    chatWithAI
};

