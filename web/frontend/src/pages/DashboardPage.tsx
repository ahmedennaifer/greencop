import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../hooks/useRooms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Server, Activity, AlertTriangle, TrendingUp, Thermometer, Droplets } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { rooms, isLoading } = useRooms(user?.id || null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeSensors: 0,
    activeAlerts: 0,
    avgTemperature: 0,
    avgHumidity: 0,
  });

  useEffect(() => {
    if (rooms) {
      setStats({
        totalRooms: rooms.length,
        activeSensors: 0,
        activeAlerts: 0,
        avgTemperature: 0,
        avgHumidity: 0,
      });
    }
  }, [rooms]);

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of your server rooms</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Rooms</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRooms}</div>
              <p className="text-xs text-gray-500 mt-1">Server rooms monitored</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sensors</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeSensors}</div>
              <p className="text-xs text-gray-500 mt-1">Currently online</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.activeAlerts}</div>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">Good</div>
              <p className="text-xs text-gray-500 mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Environment Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <CardTitle>Temperature Overview</CardTitle>
              </div>
              <CardDescription>Average temperature across all sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-orange-500 mb-2">
                {stats.avgTemperature}°C
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-red-500"
                  style={{ width: `${(stats.avgTemperature / 50) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0°C</span>
                <span>50°C</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <CardTitle>Humidity Overview</CardTitle>
              </div>
              <CardDescription>Average humidity across all sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-blue-500 mb-2">
                {stats.avgHumidity}%
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-blue-400 to-blue-600"
                  style={{ width: `${stats.avgHumidity}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Set up your IoT monitoring system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all text-left group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Create Server Room</h3>
                </div>
                <p className="text-sm text-gray-600 ml-15">
                  Organize your sensors by creating server rooms
                </p>
              </button>

              <button className="p-5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:shadow-md transition-all text-left group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Register Sensors</h3>
                </div>
                <p className="text-sm text-gray-600 ml-15">
                  Connect your ESP32 sensor nodes to start monitoring
                </p>
              </button>

              <button className="p-5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:shadow-md transition-all text-left group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Configure Alerts</h3>
                </div>
                <p className="text-sm text-gray-600 ml-15">
                  Set temperature and humidity thresholds for notifications
                </p>
              </button>

              <button className="p-5 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:shadow-md transition-all text-left group">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">View Analytics</h3>
                </div>
                <p className="text-sm text-gray-600 ml-15">
                  Monitor trends and analyze historical sensor data
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
