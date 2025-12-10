import apiClient from '../client';
import type { Sensor } from '../../types';

export const sensorService = {
  async createSensor(data: { id: number; name: string; type?: string; room_id: number }): Promise<Sensor> {
    const response = await apiClient.post<Sensor>('/api/v1/sensors/new_sensor', data);
    return response.data;
  },

  async getSensor(sensorId: number): Promise<Sensor> {
    const response = await apiClient.get<Sensor>(`/api/v1/sensors/sensor/${sensorId}`);
    return response.data;
  },

  async listSensorsByRoom(roomId: number): Promise<Sensor[]> {
    const response = await apiClient.get<Sensor[]>(`/api/v1/sensors/list_sensors/${roomId}`);
    return response.data;
  },

  async getSensorByName(roomId: number, sensorName: string): Promise<Sensor> {
    const response = await apiClient.get<Sensor>(`/api/v1/sensors/sensor_by_name/${roomId}/${sensorName}`);
    return response.data;
  },

  async updateSensor(sensorId: number, data: { id: number; name: string; type?: string; room_id: number }): Promise<Sensor> {
    const response = await apiClient.put<Sensor>(`/api/v1/sensors/update_sensor/${sensorId}`, data);
    return response.data;
  },

  async deleteSensor(sensorId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/v1/sensors/delete_sensor/${sensorId}`);
    return response.data;
  },
};
