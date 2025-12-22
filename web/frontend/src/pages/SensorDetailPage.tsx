import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Thermometer, Droplets, TrendingUp, Activity } from 'lucide-react';
import { dataService } from '../api/services/data.service';
import apiClient from '../api/client';
import type { SensorData, Sensor } from '../types';
import Button from '../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SensorDetailPage: React.FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    if (sensorId) {
      fetchSensorData();
    }
  }, [sensorId, timeRange]);

  const fetchSensorData = async () => {
    if (!sensorId) return;

    try {
      setLoading(true);

      // Fetch sensor details - sensor ID is a string (node_id)
      const response = await apiClient.get(`/api/v1/sensors/sensor/${sensorId}`);
      setSensor(response.data);

      // Fetch latest reading
      const latest = await dataService.getLatestReading(sensorId);
      setLatestData(latest);

      // Fetch historical data
      // Use a wide time range to capture available data (last 30 days)
      const endTime = new Date().toISOString();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 30); // Get last 30 days of data

      let historical = await dataService.getHistoricalData(sensorId, startTime.toISOString(), endTime);

      // Filter based on selected time range
      if (historical.length > 0) {
        const filterTime = new Date();
        if (timeRange === '1h') {
          filterTime.setHours(filterTime.getHours() - 1);
        } else if (timeRange === '24h') {
          filterTime.setHours(filterTime.getHours() - 24);
        } else {
          filterTime.setDate(filterTime.getDate() - 7);
        }

        const filtered = historical.filter(d => new Date(d.timestamp) >= filterTime);
        historical = filtered.length > 0 ? filtered : historical.slice(-100); // Show last 100 if no recent data
      }

      setHistoricalData(historical);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = historicalData.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: d.temperature,
    humidity: d.humidity,
  }));

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/sensors')}
            className="mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sensors</span>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {sensor?.name || 'Loading...'}
              </h1>
              <p className="text-gray-600">Sensor ID: {sensorId}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={timeRange === '1h' ? 'default' : 'outline'}
                onClick={() => setTimeRange('1h')}
                size="sm"
              >
                1 Hour
              </Button>
              <Button
                variant={timeRange === '24h' ? 'default' : 'outline'}
                onClick={() => setTimeRange('24h')}
                size="sm"
              >
                24 Hours
              </Button>
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                onClick={() => setTimeRange('7d')}
                size="sm"
              >
                7 Days
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading sensor data...</p>
          </div>
        ) : (
          <>
            {/* Current Readings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                    <span>Current Temperature</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600">
                    {latestData ? `${latestData.temperature.toFixed(1)}°C` : 'N/A'}
                  </div>
                  {latestData && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(latestData.timestamp).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Droplets className="w-5 h-5 text-green-600" />
                    <span>Current Humidity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">
                    {latestData ? `${latestData.humidity.toFixed(1)}%` : 'N/A'}
                  </div>
                  {latestData && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(latestData.timestamp).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Temperature Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Temperature History</span>
                </CardTitle>
                <CardDescription>Temperature readings over time</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ea580c"
                        strokeWidth={2}
                        name="Temperature (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-gray-500">No historical data available</p>
                )}
              </CardContent>
            </Card>

            {/* Humidity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Humidity History</span>
                </CardTitle>
                <CardDescription>Humidity readings over time</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Humidity (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-gray-500">No historical data available</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SensorDetailPage;
