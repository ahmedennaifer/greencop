import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Brain, TrendingUp, Activity, Zap } from 'lucide-react';
import apiClient from '../api/client';

interface SensorReading {
  node_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  prediction?: number;
}

interface MLStats {
  total_predictions: number;
  anomalies_detected: number;
  normal_readings: number;
  accuracy_rate: number;
}

const MLDashboardPage: React.FC = () => {
  const [recentReadings, setRecentReadings] = useState<SensorReading[]>([]);
  const [mlStats, setMLStats] = useState<MLStats>({
    total_predictions: 0,
    anomalies_detected: 0,
    normal_readings: 0,
    accuracy_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMLData();
    const interval = setInterval(fetchMLData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMLData = async () => {
    try {
      const response = await apiClient.get('/api/v1/data/recent', {
        params: { limit: 50 }
      });

      const readings = response.data;
      setRecentReadings(readings);

      const anomalies = readings.filter((r: SensorReading) => r.prediction === -1).length;
      const normal = readings.filter((r: SensorReading) => r.prediction === 1).length;

      setMLStats({
        total_predictions: readings.length,
        anomalies_detected: anomalies,
        normal_readings: normal,
        accuracy_rate: readings.length > 0 ? ((normal / readings.length) * 100) : 0,
      });
    } catch (err) {
      console.error('Error fetching ML data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ML Anomaly Detection</h1>
          <p className="text-gray-600">Real-time machine learning predictions and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Predictions</CardTitle>
              <Brain className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mlStats.total_predictions}</div>
              <p className="text-xs text-gray-500">Last 50 readings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Anomalies Detected</CardTitle>
              <Zap className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{mlStats.anomalies_detected}</div>
              <p className="text-xs text-gray-500">Flagged by ML model</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Normal Readings</CardTitle>
              <Activity className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mlStats.normal_readings}</div>
              <p className="text-xs text-gray-500">Within normal range</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Normal Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mlStats.accuracy_rate.toFixed(1)}%</div>
              <p className="text-xs text-gray-500">Prediction ratio</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Real-time ML model predictions on sensor data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading predictions...</p>
            ) : recentReadings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sensor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Temperature</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Humidity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prediction</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReadings.map((reading, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{reading.node_id}</td>
                        <td className="py-3 px-4 text-sm">{reading.temperature}°C</td>
                        <td className="py-3 px-4 text-sm">{reading.humidity}%</td>
                        <td className="py-3 px-4">
                          {reading.prediction === -1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Anomaly
                            </span>
                          ) : reading.prediction === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Normal
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(reading.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No predictions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MLDashboardPage;
