import apiClient from '../client';
import type { ServerRoom } from '../../types';

export const roomService = {
  async createRoom(name: string, customerId: number): Promise<ServerRoom> {
    const response = await apiClient.post<ServerRoom>('/api/v1/server_rooms/new_room', {
      name,
      customer_id: customerId,
    });
    return response.data;
  },

  async getRoom(roomId: number): Promise<ServerRoom> {
    const response = await apiClient.get<ServerRoom>(`/api/v1/server_rooms/room/${roomId}`);
    return response.data;
  },

  async listRoomsByCustomer(customerId: number): Promise<ServerRoom[]> {
    const response = await apiClient.get<ServerRoom[]>(`/api/v1/server_rooms/list_rooms/${customerId}`);
    return response.data;
  },

  async updateRoom(roomId: number, name: string, customerId: number): Promise<ServerRoom> {
    const response = await apiClient.put<ServerRoom>(`/api/v1/server_rooms/update_room/${roomId}`, {
      name,
      customer_id: customerId,
    });
    return response.data;
  },

  async deleteRoom(roomId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/v1/server_rooms/delete_room/${roomId}`);
    return response.data;
  },
};
