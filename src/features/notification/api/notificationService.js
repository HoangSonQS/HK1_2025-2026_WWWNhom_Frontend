import apiClient from '../../../services/apiClient';

export const getMyNotifications = async () => {
  const response = await apiClient.get('/notifications/my-notifications');
  return response;
};

export const markAsRead = async (notificationId) => {
  const response = await apiClient.put(`/notifications/${notificationId}/read`);
  return response;
};

export const markAllAsRead = async () => {
  const response = await apiClient.put('/notifications/mark-all-read');
  return response;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response;
};

