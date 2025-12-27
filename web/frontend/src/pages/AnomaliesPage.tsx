import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, Filter, Activity, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/client';
import Button from '../components/ui/Button';
import { alertService } from '../api/services/alert.service';
import { extractErrorMessage } from '../utils/errorHandler';

interface Anomaly {
  id: number;
  sensor_id: string;
  alert_type: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  feedback: string | null;
}

interface AnomalyStats {
  total_anomalies: number;
  last_24h: number;
  last_7d: number;
  hourly_distribution: [string, number][];
  daily_distribution: [string, number][];
  sensor_distribution: [string, number][];
}

const AnomaliesPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sensorNames, setSensorNames] = useState<Record<string, string>>({});
  const [filterSensor, setFilterSensor] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'acknowledged'>('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [anomaliesRes, statsRes] = await Promise.all([
        apiClient.get('/api/v1/alerts/anomalies', { params: { limit: 100 } }),
        apiClient.get('/api/v1/alerts/anomalies/stats')
      ]);

      setAnomalies(anomaliesRes.data);
      setStats(statsRes.data);

      const sensorIds = [...new Set(anomaliesRes.data.map((a: Anomaly) => a.sensor_id))];
      const names: Record<string, string> = {};
      for (const id of sensorIds) {
        try {
          const response = await apiClient.get(`/api/v1/sensors/sensor/${id}`);
          names[id] = response.data.name;
        } catch {
          names[id] = `Node ${id}`;
        }
      }
      setSensorNames(names);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertService.acknowledgeAlert(alertId);
      fetchData();
    } catch (err: any) {
      alert(extractErrorMessage(err) || 'Failed to acknowledge anomaly');
    }
  };

  const handleFeedback = async (alertId: number, feedbackType: 'false_positive' | 'true_positive') => {
    try {
      await alertService.submitFeedback(alertId, feedbackType);
      fetchData();
    } catch (err: any) {
      alert(extractErrorMessage(err) || 'Failed to submit feedback');
    }
  };

  const handleClearAll = async () => {
    try {
      const result = await alertService.clearAllAnomalies();
      alert(`Cleared ${result.cleared} anomalies`);
      fetchData();
    } catch (err: any) {
      alert(extractErrorMessage(err) || 'Failed to clear all anomalies');
    }
  };

  const filterAnomalies = (anomaliesList: Anomaly[]) => {
    return anomaliesList.filter(anomaly => {
      const sensorMatch = filterSensor === 'all' || anomaly.sensor_id === filterSensor;

      const anomalyDate = new Date(anomaly.timestamp);
      const dateFromMatch = !filterDateFrom || anomalyDate >= new Date(filterDateFrom);
      const dateToMatch = !filterDateTo || anomalyDate <= new Date(filterDateTo);

      const statusMatch =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !anomaly.acknowledged) ||
        (filterStatus === 'acknowledged' && anomaly.acknowledged);

      return sensorMatch && dateFromMatch && dateToMatch && statusMatch;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  const hourlyData = stats?.hourly_distribution.slice(-24).map(([hour, count]) => ({
    hour: new Date(hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    count
  })) || [];

  const dailyData = stats?.daily_distribution.slice(-7).map(([day, count]) => ({
    day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count
  })) || [];

  const sensorData = stats?.sensor_distribution.slice(0, 10).map(([sensor, count]) => ({
    sensor: sensorNames[sensor] || sensor,
    count
  })) || [];

  const uniqueSensorIds = [...new Set(anomalies.map(a => a.sensor_id))];
  const filteredAnomalies = filterAnomalies(anomalies);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Anomaly Detection</h1>
            <p className="text-gray-600">ML-powered anomaly detection with forecasting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Total Anomalies</CardTitle>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.total_anomalies || 0}</div>
              <p className="text-xs text-red-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Last 24 Hours</CardTitle>
              <Activity className="h-6 w-6 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.last_24h || 0}</div>
              <p className="text-xs text-orange-600 mt-1">Recent activity</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Last 7 Days</CardTitle>
              <Activity className="h-6 w-6 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats?.last_7d || 0}</div>
              <p className="text-xs text-yellow-600 mt-1">Weekly trend</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Anomalies Per Hour (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} name="Anomalies" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anomalies Per Day (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#dc2626" name="Anomalies" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Sensors with Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sensorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="sensor" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#dc2626" name="Anomalies" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'active' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterStatus === 'acknowledged' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('acknowledged')}
                  >
                    Acknowledged
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sensor</label>
                <select
                  value={filterSensor}
                  onChange={(e) => setFilterSensor(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Sensors</option>
                  {uniqueSensorIds.map(id => (
                    <option key={id} value={id}>
                      {sensorNames[id] || `Sensor ${id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date-Time From</label>
                <input
                  type="datetime-local"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date-Time To</label>
                <input
                  type="datetime-local"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span>Recent Anomalies</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">ML-detected anomalous behavior</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-red-600">{filteredAnomalies.length}</div>
                {filteredAnomalies.filter(a => !a.acknowledged).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Clear All</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAnomalies.length > 0 ? (
              <div className="space-y-3">
                {filteredAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {sensorNames[anomaly.sensor_id] || `Sensor ${anomaly.sensor_id}`}
                        </h4>
                        <p className="text-sm text-gray-600">{anomaly.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(anomaly.timestamp)}
                        </p>
                        {anomaly.feedback && (
                          <div className="flex items-center space-x-1 mt-2">
                            {anomaly.feedback === 'false_positive' ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                                False Positive
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-700">
                                Confirmed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {!anomaly.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(anomaly.id)}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Acknowledge</span>
                        </Button>
                      )}
                      {!anomaly.feedback && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback(anomaly.id, 'false_positive')}
                            className="flex items-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>False Alarm</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback(anomaly.id, 'true_positive')}
                            className="flex items-center space-x-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Anomalies Detected</h3>
                <p className="text-gray-600">All systems operating normally</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnomaliesPage;
