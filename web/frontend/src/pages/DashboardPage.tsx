import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../hooks/useRooms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Server, Activity, AlertTriangle, TrendingUp, Thermometer, Droplets, Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sensorService } from '../api/services/sensor.service';
import { alertService } from '../api/services/alert.service';
import { dataService } from '../api/services/data.service';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { rooms, isLoading } = useRooms(user?.id || null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeSensors: 0,
    activeAlerts: 0,
    avgTemperature: 0,
    avgHumidity: 0,
  });
  const [sensorReadings, setSensorReadings] = useState<Array<{name: string, temperature: number, humidity: number}>>([]);
  const [historicalData, setHistoricalData] = useState<Array<{time: string, temperature: number, humidity: number}>>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!rooms) return;

      try {
        setLoading(true);

        // Fetch sensors for all rooms
        const allSensors = [];
        for (const room of rooms) {
          try {
            const roomSensors = await sensorService.listSensorsByRoom(room.id);
            allSensors.push(...roomSensors);
          } catch (err) {
            console.error(`Error fetching sensors for room ${room.id}:`, err);
          }
        }

        // Fetch alerts
        let alertCount = 0;
        try {
          const [activeAlerts, alertHistory] = await Promise.all([
            alertService.getActiveAlerts(),
            alertService.getAlertHistory(6)
          ]);
          alertCount = activeAlerts.length;
          setRecentAlerts(alertHistory);
        } catch (err) {
          console.error('Error fetching alerts:', err);
        }

        // Fetch latest data for all sensors
        const readings = [];
        let totalTemp = 0;
        let totalHumidity = 0;
        let validReadings = 0;

        for (const sensor of allSensors) {
          try {
            const data = await dataService.getLatestReading(sensor.id.toString());
            readings.push({
              name: sensor.name,
              temperature: data.temperature,
              humidity: data.humidity,
            });
            totalTemp += data.temperature;
            totalHumidity += data.humidity;
            validReadings++;
          } catch (err) {
            console.error(`Error fetching data for sensor ${sensor.id}:`, err);
          }
        }

        setSensorReadings(readings);

        // Fetch historical data for trend chart (last 24 hours for first sensor)
        if (allSensors.length > 0) {
          try {
            const endTime = new Date().toISOString();
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - 30); // Get last 30 days

            const historical = await dataService.getHistoricalData(
              allSensors[0].id.toString(),
              startTime.toISOString(),
              endTime
            );

            // Take last 50 points and format for chart
            const trendData = historical.slice(-50).map(d => ({
              time: new Date(d.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              temperature: d.temperature,
              humidity: d.humidity,
            }));

            setHistoricalData(trendData);
          } catch (err) {
            console.error('Error fetching historical data:', err);
          }
        }

        setStats({
          totalRooms: rooms.length,
          activeSensors: allSensors.length,
          activeAlerts: alertCount,
          avgTemperature: validReadings > 0 ? totalTemp / validReadings : 0,
          avgHumidity: validReadings > 0 ? totalHumidity / validReadings : 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [rooms]);

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of your server rooms</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalRooms}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Sensors</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.activeSensors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.activeAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Temperature</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading || sensorReadings.length === 0 ? '--' : `${stats.avgTemperature.toFixed(1)}°C`}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {sensorReadings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature & Humidity Combined */}
            <Card>
              <CardHeader>
                <CardTitle>Temperature & Humidity</CardTitle>
                <CardDescription>Current readings across all sensors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sensorReadings} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="temperature" fill="#ea580c" name="Temperature (°C)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="humidity" fill="#2563eb" name="Humidity (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Historical Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Trends</CardTitle>
                <CardDescription>Temperature and humidity over time</CardDescription>
              </CardHeader>
              <CardContent>
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ea580c"
                        strokeWidth={2}
                        name="Temperature (°C)"
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Humidity (%)"
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    Loading historical data...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sensor Data</h3>
              <p className="text-gray-600 mb-4">Register sensors to start monitoring</p>
              <Button onClick={() => navigate('/sensors')}>Go to Sensors</Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Alerts */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Recent Alerts</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/alerts')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentAlerts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/alerts')}
                    >
                      <div className={`p-2 rounded-lg ${
                        alert.alert_type === 'temperature' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        {alert.alert_type === 'temperature' ? (
                          <Thermometer className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Droplets className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {alert.acknowledged && (
                        <div className="text-green-600 text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No recent alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
