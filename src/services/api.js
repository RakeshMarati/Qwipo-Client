import axios from 'axios';

// Replace this URL with your actual Render server URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://qwipo-server.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Customer API functions
export const customerAPI = {
  getCustomers: (params = {}) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// Address API functions
export const addressAPI = {
  getAddresses: (customerId) => api.get(`/customers/${customerId}/addresses`),
  addAddress: (customerId, data) => api.post(`/customers/${customerId}/addresses`, data),
  updateAddress: (addressId, data) => api.put(`/customers/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/customers/addresses/${addressId}`),
  searchAddresses: (params = {}) => api.get('/addresses/search', { params }),
};

export default api;
