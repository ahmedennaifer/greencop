import apiClient from '../client';
import type { Alert, AlertThreshold } from '../../types';

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

  async submitFeedback(alertId: number, feedbackType: 'false_positive' | 'true_positive'): Promise<Alert> {
    const response = await apiClient.post<Alert>(`/api/v1/alerts/${alertId}/feedback`, {
      feedback_type: feedbackType,
    });
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

  async acknowledgeAll(): Promise<{ acknowledged: number }> {
    const response = await apiClient.post<{ acknowledged: number }>('/api/v1/alerts/acknowledge-all');
    return response.data;
  },

  async confirmAll(): Promise<{ confirmed: number }> {
    const response = await apiClient.post<{ confirmed: number }>('/api/v1/alerts/confirm-all');
    return response.data;
  },

  async clearAllAnomalies(): Promise<{ cleared: number }> {
    const response = await apiClient.post<{ cleared: number }>('/api/v1/alerts/anomalies/clear-all');
    return response.data;
  },
};
