import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../api/services/data.service';
import type { SensorData } from '../types';

export const useSensorData = (sensorId: number | null, pollingInterval = 5000) => {
  const [data, setData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!sensorId) return;

    try {
      setIsLoading(true);
      const latestData = await dataService.getLatestReading(sensorId);
      setData(latestData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch sensor data');
    } finally {
      setIsLoading(false);
    }
  }, [sensorId]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchData, pollingInterval]);

  return { data, isLoading, error, refetch: fetchData };
};
