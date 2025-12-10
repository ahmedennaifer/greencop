import { useState, useEffect } from 'react';
import { roomService } from '../api/services/room.service';
import type { ServerRoom } from '../types';

export const useRooms = (customerId: number | null) => {
  const [rooms, setRooms] = useState<ServerRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const data = await roomService.listRoomsByCustomer(customerId);
      setRooms(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [customerId]);

  const createRoom = async (name: string) => {
    if (!customerId) throw new Error('No customer ID');
    const newRoom = await roomService.createRoom(name, customerId);
    setRooms((prev) => [...prev, newRoom]);
    return newRoom;
  };

  const deleteRoom = async (roomId: number) => {
    await roomService.deleteRoom(roomId);
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  return { rooms, isLoading, error, refetch: fetchRooms, createRoom, deleteRoom };
};
