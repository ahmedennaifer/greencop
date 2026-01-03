import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, Server, Thermometer, Droplets, Activity, AlertTriangle, Search } from 'lucide-react';
import { sensorService } from '../api/services/sensor.service';
import { dataService } from '../api/services/data.service';
import { alertService } from '../api/services/alert.service';
import apiClient from '../api/client';
import type { Sensor, SensorData, Alert } from '../types';
import Button from '../components/ui/Button';

const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorStats, setSensorStats] = useState<{
    [sensorId: string]: {
      latestData: SensorData | null;
      avgTemp: number;
      avgHumidity: number;
    };
  }>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  const fetchRoomData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);

      // Fetch room details
      const roomResponse = await apiClient.get(`/api/v1/server_rooms/room/${roomId}`);
      setRoom(roomResponse.data);

      // Fetch sensors in this room
      const sensorsData = await sensorService.listSensorsByRoom(parseInt(roomId));
      setSensors(sensorsData);

      // Fetch stats for each sensor
      const stats: typeof sensorStats = {};
      await Promise.all(
        sensorsData.map(async (sensor) => {
          try {
            const latest = await dataService.getLatestReading(sensor.id);

            // Get last 24h data for averages
            const endTime = new Date().toISOString();
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);
            const historical = await dataService.getHistoricalData(
              sensor.id,
              startTime.toISOString(),
              endTime
            );

            let avgTemp = 0;
            let avgHumidity = 0;
            if (historical.length > 0) {
              avgTemp = historical.reduce((sum, d) => sum + d.temperature, 0) / historical.length;
              avgHumidity = historical.reduce((sum, d) => sum + d.humidity, 0) / historical.length;
            }

            stats[sensor.id] = {
              latestData: latest,
              avgTemp,
              avgHumidity,
            };
          } catch (err) {
            console.error(`Error fetching stats for sensor ${sensor.id}:`, err);
            stats[sensor.id] = {
              latestData: null,
              avgTemp: 0,
              avgHumidity: 0,
            };
          }
        })
      );
      setSensorStats(stats);

      // Fetch recent alerts for this room's sensors
      const allAlerts = await alertService.getAlertHistory(50);
      const roomAlerts = allAlerts.filter(alert =>
        sensorsData.some(sensor => sensor.id === alert.sensor_id)
      );
      setAlerts(roomAlerts.slice(0, 10));
    } catch (err) {
      console.error('Error fetching room data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate room-wide statistics
  const roomStats = {
    totalSensors: sensors.length,
    activeSensors: Object.values(sensorStats).filter(s => s.latestData).length,
    avgTemp: sensors.length > 0
      ? Object.values(sensorStats).reduce((sum, s) => sum + (s.latestData?.temperature || 0), 0) / sensors.length
      : 0,
    avgHumidity: sensors.length > 0
      ? Object.values(sensorStats).reduce((sum, s) => sum + (s.latestData?.humidity || 0), 0) / sensors.length
      : 0,
    recentAlerts: alerts.filter(a => !a.acknowledged).length,
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/rooms')}
            className="mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Rooms</span>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {room?.name || 'Loading...'}
              </h1>
              <p className="text-gray-600">Room ID: {roomId}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading room data...</p>
          </div>
        ) : (
          <>
            {/* Room Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Server className="w-5 h-5 text-blue-600" />
                    <span>Total Sensors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">
                    {roomStats.totalSensors}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {roomStats.activeSensors} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                    <span>Avg Temperature</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600">
                    {roomStats.avgTemp > 0 ? `${roomStats.avgTemp.toFixed(1)}°C` : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Across all sensors
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Droplets className="w-5 h-5 text-green-600" />
                    <span>Avg Humidity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">
                    {roomStats.avgHumidity > 0 ? `${roomStats.avgHumidity.toFixed(1)}%` : 'N/A'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Across all sensors
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Active Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600">
                    {roomStats.recentAlerts}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Unacknowledged
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sensor Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search Sensors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Search by sensor name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </CardContent>
            </Card>

            {/* Sensors List */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Sensors in this Room</span>
                </CardTitle>
                <CardDescription>
                  {filteredSensors.length} sensor{filteredSensors.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSensors.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSensors.map((sensor) => {
                      const stats = sensorStats[sensor.id];
                      return (
                        <div
                          key={sensor.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                          onClick={() => navigate(`/sensors/${sensor.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {sensor.name}
                              </h3>
                              <p className="text-sm text-gray-500">ID: {sensor.id}</p>
                              {sensor.type && (
                                <p className="text-sm text-gray-500">Type: {sensor.type}</p>
                              )}
                            </div>
                            <div className="flex space-x-6">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Temperature</p>
                                <p className="text-xl font-bold text-orange-600">
                                  {stats?.latestData
                                    ? `${stats.latestData.temperature.toFixed(1)}°C`
                                    : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  24h avg: {stats?.avgTemp > 0 ? `${stats.avgTemp.toFixed(1)}°C` : 'N/A'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Humidity</p>
                                <p className="text-xl font-bold text-green-600">
                                  {stats?.latestData
                                    ? `${stats.latestData.humidity.toFixed(1)}%`
                                    : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  24h avg: {stats?.avgHumidity > 0 ? `${stats.avgHumidity.toFixed(1)}%` : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          {stats?.latestData && (
                            <p className="text-xs text-gray-400 mt-2">
                              Last reading: {new Date(stats.latestData.timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No sensors match your search' : 'No sensors in this room'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Recent Alerts</span>
                </CardTitle>
                <CardDescription>Last 10 alerts for this room</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 border rounded-lg ${
                          alert.acknowledged
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{alert.message}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Sensor: {alert.sensor_id} • Type: {alert.alert_type}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              alert.acknowledged
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-red-200 text-red-700'
                            }`}
                          >
                            {alert.acknowledged ? 'Acknowledged' : 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">No recent alerts</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RoomDetailPage;
