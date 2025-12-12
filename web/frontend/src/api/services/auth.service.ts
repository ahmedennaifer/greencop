import apiClient from '../client';
import type { LoginRequest, LoginResponse, RegisterRequest, Customer } from '../../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/customers/login', credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>('/api/v1/customers/register', data);
    return response.data;
  },

  async getCustomerInfo(customerId: number): Promise<Customer> {
    const response = await apiClient.post<Customer>(`/api/v1/customers/info/${customerId}`);
    return response.data;
  },

  async updateCustomer(customerId: number, data: Partial<RegisterRequest>): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/api/v1/customers/${customerId}`, data);
    return response.data;
  },
};
