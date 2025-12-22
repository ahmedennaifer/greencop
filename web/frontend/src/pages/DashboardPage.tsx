import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../hooks/useRooms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Server, Activity, AlertTriangle, Thermometer, ThumbsUp, ThumbsDown } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sensorService } from '../api/services/sensor.service';
import { alertService } from '../api/services/alert.service';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import apiClient from '../api/client';

interface SensorReading {
  node_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  prediction?: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { rooms } = useRooms(user?.id || null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeSensors: 0,
    activeAlerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState<SensorReading[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>('20e7c89f14ec');
  const [availableSensors, setAvailableSensors] = useState<string[]>([]);
  const [predictedAnomaly, setPredictedAnomaly] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: 'correct' | 'incorrect' | null }>({});

  useEffect(() => {
    const fetchStats = async () => {
      if (!rooms) return;

      try {
        setLoading(true);
        const allSensors = [];
        for (const room of rooms) {
          try {
            const roomSensors = await sensorService.listSensorsByRoom(room.id);
            allSensors.push(...roomSensors);
          } catch (err) {
            console.error(`Error fetching sensors for room ${room.id}:`, err);
          }
        }

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

        setStats({
          totalRooms: rooms.length,
          activeSensors: allSensors.length,
          activeAlerts: alertCount,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [rooms]);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [selectedSensor]);

  const fetchLiveData = async () => {
    try {
      const response = await apiClient.get('/api/v1/data/recent', {
        params: { limit: 50 }
      });

      const readings = response.data.filter((r: SensorReading) => r.node_id === selectedSensor);
      setLiveData(readings);

      const sensors = [...new Set(response.data.map((r: SensorReading) => r.node_id))];
      setAvailableSensors(sensors);

      if (selectedSensor) {
        try {
          const predictionResponse = await apiClient.get(`/api/v1/data/predict-anomaly/${selectedSensor}`);
          setPredictedAnomaly(predictionResponse.data.anomaly_predicted);
          setPredictionData(predictionResponse.data);
        } catch (err) {
          console.error('Error fetching prediction:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    }
  };

  const handleFeedback = async (timestamp: string, isCorrect: boolean) => {
    try {
      await apiClient.post('/api/v1/feedback', {
        timestamp,
        feedback: isCorrect ? 'correct' : 'incorrect'
      });
      setFeedback(prev => ({ ...prev, [timestamp]: isCorrect ? 'correct' : 'incorrect' }));
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Live data chart
  const liveChartData = liveData
    .slice(-20) // Last 20 readings
    .map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      temperature: reading.temperature,
      humidity: reading.humidity,
      isAnomaly: reading.prediction === -1,
    }));

  // Prediction chart data
  const predictionChartData = [];
  if (predictionData && liveData.length > 0) {
    const lastReading = liveData[liveData.length - 1];
    const tempDelta = predictionData.trend.temp_delta_per_reading;
    const humDelta = predictionData.trend.humidity_delta_per_reading;

    // Current point
    predictionChartData.push({
      time: 'Now',
      temperature: lastReading.temperature,
      humidity: lastReading.humidity,
      isNow: true,
    });

    // Future predictions (10 steps = ~10 seconds)
    for (let i = 1; i <= 10; i++) {
      predictionChartData.push({
        time: `+${i}s`,
        temperature: lastReading.temperature + (tempDelta * i),
        humidity: lastReading.humidity + (humDelta * i),
        isNow: false,
      });
    }
  }

  const anomalies = liveData.filter(r => r.prediction === -1);

  const LiveTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-1">{data.time}</p>
          <p className="text-sm" style={{ color: '#f97316' }}>
            Temperature: {data.temperature.toFixed(1)}°C
          </p>
          <p className="text-sm" style={{ color: '#3b82f6' }}>
            Humidity: {data.humidity.toFixed(1)}%
          </p>
          {data.isAnomaly && (
            <p className="text-sm text-red-600 font-bold mt-1">⚠ ANOMALY</p>
          )}
        </div>
      );
    }
    return null;
  };

  const PredictionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-1">{data.time}</p>
          <p className="text-sm" style={{ color: '#f97316' }}>
            Temperature: {data.temperature.toFixed(1)}°C
          </p>
          <p className="text-sm" style={{ color: '#3b82f6' }}>
            Humidity: {data.humidity.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Live Sensor Monitoring</h1>
          <p className="text-gray-600">Real-time data with ML-powered anomaly detection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalRooms}</p>
              </div>
              <Server className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Active Sensors</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.activeSensors}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.activeAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sensor:</label>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableSensors.map(sensor => (
                <option key={sensor} value={sensor}>{sensor}</option>
              ))}
            </select>
          </div>
          {predictedAnomaly && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-700" />
              <span className="text-sm font-bold text-red-900">ANOMALY PREDICTED</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Live Data Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Stream</CardTitle>
              <CardDescription>Real-time sensor readings (last 20)</CardDescription>
            </CardHeader>
            <CardContent>
              {liveChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={liveChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#666' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#666' }} />
                    <Tooltip content={<LiveTooltip />} />
                    <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.isAnomaly) {
                          return <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#991b1b" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={2} fill="#f97316" />;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.isAnomaly) {
                          return <circle cx={cx} cy={cy} r={5} fill="#dc2626" stroke="#991b1b" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={2} fill="#3b82f6" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Loading...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prediction Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ML Prediction</CardTitle>
              <CardDescription>10-second trajectory forecast</CardDescription>
            </CardHeader>
            <CardContent>
              {predictionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={predictionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#666' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#666' }} />
                    <Tooltip content={<PredictionTooltip />} />
                    <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.isNow) {
                          return <circle cx={cx} cy={cy} r={5} fill="#f97316" stroke="#ea580c" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={3} fill="#f97316" fillOpacity={0.6} />;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.isNow) {
                          return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" stroke="#2563eb" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={3} fill="#3b82f6" fillOpacity={0.6} />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No prediction data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {anomalies.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Anomalies Detected - Provide Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anomalies.slice(0, 5).map((reading, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-300 rounded-lg hover:bg-red-100 transition">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-900 mb-1">⚠ ANOMALY</p>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Sensor:</span> {reading.node_id} |
                        <span className="font-semibold"> Temp:</span> {reading.temperature.toFixed(1)}°C |
                        <span className="font-semibold"> Humidity:</span> {reading.humidity.toFixed(1)}% |
                        <span className="font-semibold"> Time:</span> {new Date(reading.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {feedback[reading.timestamp] === 'correct' ? (
                        <span className="text-xs text-green-700 font-bold px-3 py-1 bg-green-100 rounded">✓ Correct</span>
                      ) : feedback[reading.timestamp] === 'incorrect' ? (
                        <span className="text-xs text-orange-700 font-bold px-3 py-1 bg-orange-100 rounded">✓ Wrong</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleFeedback(reading.timestamp, true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-semibold"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Correct
                          </button>
                          <button
                            onClick={() => handleFeedback(reading.timestamp, false)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-xs font-semibold"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Wrong
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
