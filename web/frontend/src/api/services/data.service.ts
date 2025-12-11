import apiClient from '../client';
import type { SensorData } from '../../types';

// Note: These endpoints will be implemented in the BigQuery data API service
export const dataService = {
  async getLatestReading(sensorId: string): Promise<SensorData> {
    const response = await apiClient.get<SensorData>(`/api/v1/data/latest/${sensorId}`);
    return response.data;
  },

  async getHistoricalData(
    sensorId: string,
    startTime: string,
    endTime: string
  ): Promise<SensorData[]> {
    const response = await apiClient.get<SensorData[]>(`/api/v1/data/historical/${sensorId}`, {
      params: { start_time: startTime, end_time: endTime },
    });
    return response.data;
  },

  async getMultiSensorData(sensorIds: string[]): Promise<Record<string, SensorData>> {
    const response = await apiClient.post<Record<string, SensorData>>('/api/v1/data/multi-sensor', {
      sensor_ids: sensorIds,
    });
    return response.data;
  },

  async getSensorStats(sensorId: string, period: '1h' | '24h' | '7d' | '30d'): Promise<{
    avg_temperature: number;
    avg_humidity: number;
    min_temperature: number;
    max_temperature: number;
    min_humidity: number;
    max_humidity: number;
  }> {
    const response = await apiClient.get(`/api/v1/data/stats/${sensorId}`, {
      params: { period },
    });
    return response.data;
  },
};
