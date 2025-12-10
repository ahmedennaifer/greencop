import apiClient from '../client';
import type { Alert, AlertThreshold } from '../../types';

// Note: These endpoints will be implemented in the customer API
export const alertService = {
  async getActiveAlerts(): Promise<Alert[]> {
    const response = await apiClient.get<Alert[]>('/api/v1/alerts/active');
    return response.data;
  },

  async getAlertHistory(limit: number = 50): Promise<Alert[]> {
    const response = await apiClient.get<Alert[]>('/api/v1/alerts/history', {
      params: { limit },
    });
    return response.data;
  },

  async getSensorAlerts(sensorId: number): Promise<Alert[]> {
    const response = await apiClient.get<Alert[]>(`/api/v1/alerts/sensor/${sensorId}`);
    return response.data;
  },

  async acknowledgeAlert(alertId: number): Promise<Alert> {
    const response = await apiClient.post<Alert>(`/api/v1/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  async getThresholds(customerId: number): Promise<AlertThreshold> {
    const response = await apiClient.get<AlertThreshold>(`/api/v1/alerts/thresholds/${customerId}`);
    return response.data;
  },

  async updateThresholds(customerId: number, data: { max_temperature: number; max_humidity: number }): Promise<AlertThreshold> {
    const response = await apiClient.post<AlertThreshold>(`/api/v1/alerts/thresholds/${customerId}`, data);
    return response.data;
  },
};
