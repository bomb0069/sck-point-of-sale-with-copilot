import axios from 'axios';
import { 
  LoginResponse, 
  User, 
  Product, 
  Category, 
  Customer, 
  Store, 
  Sale,
  CreateSale,
  SalesReport,
  ApiResponse,
  LoyaltyPointTransaction,
  LoyaltyPointBalance,
  CustomerLoyaltySummary,
  LoyaltyRedemption
} from '../types';

// Configure base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: string;
}): Promise<ApiResponse<{ user_id: number }>> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// User API
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

// Product API
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

// Category API
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

// Customer API
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get('/customers');
  return response.data;
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

// Store API
export const getStores = async (): Promise<Store[]> => {
  const response = await api.get('/stores');
  return response.data;
};

export const getStore = async (id: number): Promise<Store> => {
  const response = await api.get(`/stores/${id}`);
  return response.data;
};

export const createStore = async (storeData: Partial<Store>): Promise<Store> => {
  const response = await api.post('/stores', storeData);
  return response.data;
};

export const updateStore = async (id: number, storeData: Partial<Store>): Promise<Store> => {
  const response = await api.put(`/stores/${id}`, storeData);
  return response.data;
};

export const deleteStore = async (id: number): Promise<void> => {
  await api.delete(`/stores/${id}`);
};

// Sales API
export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get('/sales');
  return response.data;
};

export const getSale = async (id: number): Promise<Sale> => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

export const createSale = async (saleData: CreateSale): Promise<Sale> => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const refundSale = async (id: number): Promise<Sale> => {
  const response = await api.post(`/sales/${id}/refund`);
  return response.data;
};

// Reports API
export const getDailySalesReport = async (date?: string): Promise<SalesReport> => {
  const params = date ? `?date=${date}` : '';
  const response = await api.get(`/sales/reports/daily${params}`);
  return response.data;
};

export const getMonthlySalesReport = async (month?: string): Promise<SalesReport> => {
  const params = month ? `?month=${month}` : '';
  const response = await api.get(`/sales/reports/monthly${params}`);
  return response.data;
};

// Loyalty Points API
export const getCustomerLoyaltySummary = async (customerId: number): Promise<CustomerLoyaltySummary> => {
  const response = await api.get(`/customers/${customerId}/loyalty/summary`);
  return response.data;
};

export const getCustomerLoyaltyTransactions = async (customerId: number): Promise<LoyaltyPointTransaction[]> => {
  const response = await api.get(`/customers/${customerId}/loyalty/transactions`);
  return response.data;
};

export const getCustomerLoyaltyBalances = async (customerId: number): Promise<LoyaltyPointBalance[]> => {
  const response = await api.get(`/customers/${customerId}/loyalty/balances`);
  return response.data;
};

export const redeemLoyaltyPoints = async (redemption: LoyaltyRedemption): Promise<ApiResponse<{ transaction_id: number }>> => {
  const response = await api.post('/loyalty/redeem', redemption);
  return response.data;
};

export const calculatePointsEarned = async (amount: number): Promise<{ points: number; baht_per_point: number }> => {
  const response = await api.get(`/loyalty/calculate-points?amount=${amount}`);
  return response.data;
};

export const calculatePointsValue = async (points: number): Promise<{ baht_value: number; points_per_baht: number }> => {
  const response = await api.get(`/loyalty/calculate-value?points=${points}`);
  return response.data;
};

export const getAvailableLoyaltyPoints = async (customerId: number): Promise<{ available_points: number; baht_value: number }> => {
  const response = await api.get(`/customers/${customerId}/loyalty/available`);
  return response.data;
};

export const expireLoyaltyPoints = async (): Promise<ApiResponse<{ expired_customers: number; expired_points: number }>> => {
  const response = await api.post('/loyalty/expire-points');
  return response.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
  return response.data;
};

export default api;
