import { useState, useEffect } from 'react';
import { sensorService } from '../api/services/sensor.service';
import type { Sensor } from '../types';

export const useSensors = (roomId: number | null) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = async () => {
    if (!roomId) return;

    try {
      setIsLoading(true);
      const data = await sensorService.listSensorsByRoom(roomId);
      setSensors(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch sensors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, [roomId]);

  const createSensor = async (data: { id: number; name: string; type?: string }) => {
    if (!roomId) throw new Error('No room ID');
    const newSensor = await sensorService.createSensor({ ...data, room_id: roomId });
    setSensors((prev) => [...prev, newSensor]);
    return newSensor;
  };

  const deleteSensor = async (sensorId: number) => {
    await sensorService.deleteSensor(sensorId);
    setSensors((prev) => prev.filter((sensor) => sensor.id !== sensorId));
  };

  return { sensors, isLoading, error, refetch: fetchSensors, createSensor, deleteSensor };
};
