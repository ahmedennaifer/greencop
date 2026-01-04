import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import apiClient from '../api/client';

interface Prediction {
  id: number;
  sensor_id: string;
  timestamp: string;
  predicted_temp: number;
  predicted_humidity: number;
  actual_temp: number;
  actual_humidity: number;
  anomaly_predicted: boolean;
  feedback: string | null;
  created_at: string;
}

interface Alert {
  id: number;
  sensor_id: string;
  alert_type: string;
  timestamp: string;
}

const PredictionsPage: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [filterSensor, setFilterSensor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orderBy, setOrderBy] = useState('timestamp');
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPredictions();
  }, [orderBy, orderDir]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 100,
        offset: 0,
        order_by: orderBy,
        order_dir: orderDir
      };

      if (filterSensor) params.sensor_id = filterSensor;
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();

      const res = await apiClient.get('/api/v1/prediction-feedback/search', { params });
      setPredictions(res.data);

      // Fetch anomaly alerts to cross-reference
      const alertsRes = await apiClient.get('/api/v1/alerts/history', { params: { limit: 500 } });
      setAlerts(alertsRes.data.filter((a: any) => a.alert_type === 'anomaly'));
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async () => {
    if (!searchId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/v1/prediction-feedback/${searchId}`);
      setPredictions([res.data]);
    } catch (err) {
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Predictions</h1>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search by ID</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Prediction ID"
                  />
                  <button
                    onClick={fetchById}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sensor ID</label>
                <input
                  type="text"
                  value={filterSensor}
                  onChange={(e) => setFilterSensor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Filter by sensor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order By</label>
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="timestamp">Timestamp</option>
                  <option value="id">ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Direction</label>
                <select
                  value={orderDir}
                  onChange={(e) => setOrderDir(e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={fetchPredictions}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Apply Filters
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Results ({predictions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pred Temp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Temp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pred Humidity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Humidity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anomaly</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictions.map((pred) => {
                      // Check if there's a matching anomaly alert within 30 seconds
                      const predTime = new Date(pred.timestamp).getTime();
                      const hasAnomalyAlert = alerts.some(alert => {
                        const alertTime = new Date(alert.timestamp).getTime();
                        return alert.sensor_id === pred.sensor_id && Math.abs(alertTime - predTime) < 30000;
                      });

                      return (
                      <tr key={pred.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(pred.timestamp)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.sensor_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.predicted_temp.toFixed(1)}°C</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.actual_temp.toFixed(1)}°C</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.predicted_humidity.toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.actual_humidity.toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasAnomalyAlert ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Yes</span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {pred.feedback ? (
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${pred.feedback === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {pred.feedback === 'ok' ? 'OK' : 'KO'}
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await apiClient.put(`/api/v1/prediction-feedback/${pred.id}`, {
                                      feedback: 'ok'
                                    });
                                    setPredictions(prev => prev.map(p => p.id === pred.id ? {...p, feedback: 'ok'} : p));
                                  } catch (err) {
                                    console.error('Error submitting feedback:', err);
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                              >
                                OK
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await apiClient.put(`/api/v1/prediction-feedback/${pred.id}`, {
                                      feedback: 'not_ok'
                                    });
                                    setPredictions(prev => prev.map(p => p.id === pred.id ? {...p, feedback: 'not_ok'} : p));
                                  } catch (err) {
                                    console.error('Error submitting feedback:', err);
                                  }
                                }}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                              >
                                KO
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PredictionsPage;
