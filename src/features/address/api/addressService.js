import apiClient from '../../../services/apiClient';

export const getMyAddresses = async () => {
  const response = await apiClient.get('/user/addresses');
  return response;
};

export const addAddress = async (addressData) => {
  const response = await apiClient.post('/user/addresses', addressData);
  return response;
};

export const updateAddress = async (id, addressData) => {
  const response = await apiClient.put(`/user/addresses/${id}`, addressData);
  return response;
};

export const deleteAddress = async (id) => {
  const response = await apiClient.delete(`/user/addresses/${id}`);
  return response;
};

export const setDefaultAddress = async (id) => {
  const response = await apiClient.put(`/user/addresses/${id}/set-default`);
  return response;
};

