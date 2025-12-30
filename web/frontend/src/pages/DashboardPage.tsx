import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../hooks/useRooms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Server, Activity, AlertTriangle, Thermometer, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Settings, Info, CheckCircle, XCircle, Shield, Loader } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { sensorService } from '../api/services/sensor.service';
import { alertService } from '../api/services/alert.service';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
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
  const [thresholds, setThresholds] = useState({
    maxTemp: 50,
    minTemp: 10,
    maxHumidity: 80,
    minHumidity: 20,
  });
  const [thresholdAlerts, setThresholdAlerts] = useState<string[]>([]);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<{
    isTraining: boolean;
    runId: number | null;
    message: string;
  } | null>(null);
  const [predictionAccuracy, setPredictionAccuracy] = useState<{
    totalPredictions: number;
    accuratePredictions: number;
    avgError: number;
  }>({ totalPredictions: 0, accuratePredictions: 0, avgError: 0 });
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [pendingValidations, setPendingValidations] = useState<any[]>([]);
  const [filterTempMin, setFilterTempMin] = useState<number>(-50);
  const [filterTempMax, setFilterTempMax] = useState<number>(100);
  const [filterHumMin, setFilterHumMin] = useState<number>(0);
  const [filterHumMax, setFilterHumMax] = useState<number>(100);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStartHour, setFilterStartHour] = useState<string>('');
  const [filterEndHour, setFilterEndHour] = useState<string>('');

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

  // Fetch latest prediction feedbacks from backend on mount and refresh
  useEffect(() => {
    const fetchPredictionFeedbacks = async () => {
      try {
        const response = await apiClient.get('/api/v1/prediction-feedback/all', {
          params: { limit: 10 }
        });

        // Map backend data to frontend format
        const feedbacks = response.data.map((fb: any) => ({
          id: fb.id,
          timestamp: fb.timestamp,
          sensor_id: fb.sensor_id,
          predicted_temp: fb.predicted_temp,
          predicted_humidity: fb.predicted_humidity,
          current_temp: fb.actual_temp,
          current_humidity: fb.actual_humidity,
          anomaly: fb.anomaly_predicted,
          validated: fb.feedback,
        }));

        setPendingValidations(feedbacks);
      } catch (err) {
        console.error('Error fetching prediction feedbacks:', err);
      }
    };

    fetchPredictionFeedbacks();
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000);
    return () => clearInterval(interval);
  }, [selectedSensor]);

  useEffect(() => {
    const checkTrainingStatus = async () => {
      try {
        const response = await apiClient.get('/api/v1/ml/retraining/history?limit=1');
        const latestRun = response.data[0];

        if (latestRun && latestRun.status === 'running') {
          setTrainingStatus({
            isTraining: true,
            runId: latestRun.id,
            message: `Model retraining in progress (using ${latestRun.validated_data_count || 0} validated predictions)...`
          });
        } else if (latestRun && latestRun.status === 'completed' &&
                   Date.now() - new Date(latestRun.completed_at).getTime() < 60000) {
          setTrainingStatus({
            isTraining: false,
            runId: latestRun.id,
            message: `Model retrained successfully! New version: ${latestRun.model_version}`
          });
          setTimeout(() => setTrainingStatus(null), 10000);
        } else {
          setTrainingStatus(null);
        }
      } catch (err) {
        console.error('Error checking training status:', err);
      }
    };

    checkTrainingStatus();
    const interval = setInterval(checkTrainingStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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

          // ALWAYS store predictions in backend for validation
          const currentReading = readings[readings.length - 1];
          if (currentReading) {
            try {
              // Save prediction to backend
              const feedbackResponse = await apiClient.post('/api/v1/prediction-feedback/', {
                sensor_id: selectedSensor,
                timestamp: new Date().toISOString(),
                predicted_temp: predictionResponse.data.predicted_temp,
                predicted_humidity: predictionResponse.data.predicted_humidity,
                actual_temp: currentReading.temperature,
                actual_humidity: currentReading.humidity,
                anomaly_predicted: predictionResponse.data.anomaly_predicted,
                feedback: null,
              });

              // Refresh predictions from backend after saving
              const refreshResponse = await apiClient.get('/api/v1/prediction-feedback/all', {
                params: { limit: 10 }
              });

              const feedbacks = refreshResponse.data.map((fb: any) => ({
                id: fb.id,
                timestamp: fb.timestamp,
                sensor_id: fb.sensor_id,
                predicted_temp: fb.predicted_temp,
                predicted_humidity: fb.predicted_humidity,
                current_temp: fb.actual_temp,
                current_humidity: fb.actual_humidity,
                anomaly: fb.anomaly_predicted,
                validated: fb.feedback,
              }));

              setPendingValidations(feedbacks);
            } catch (err) {
              console.error('Error saving prediction feedback:', err);
            }
          }

          // Check threshold alerts
          const alerts: string[] = [];
          const predTemp = predictionResponse.data.predicted_temp;
          const predHum = predictionResponse.data.predicted_humidity;

          if (predTemp > thresholds.maxTemp) {
            alerts.push(`Temperature will exceed maximum (${predTemp.toFixed(1)}°C > ${thresholds.maxTemp}°C)`);
          }
          if (predTemp < thresholds.minTemp) {
            alerts.push(`Temperature will fall below minimum (${predTemp.toFixed(1)}°C < ${thresholds.minTemp}°C)`);
          }
          if (predHum > thresholds.maxHumidity) {
            alerts.push(`Humidity will exceed maximum (${predHum.toFixed(1)}% > ${thresholds.maxHumidity}%)`);
          }
          if (predHum < thresholds.minHumidity) {
            alerts.push(`Humidity will fall below minimum (${predHum.toFixed(1)}% < ${thresholds.minHumidity}%)`);
          }

          setThresholdAlerts(alerts);
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

  // Unified chart data - combines live data and predictions
  const chartData = [];

  // Add last 20 live readings - they're already in correct order from BigQuery
  const recentReadings = liveData.slice(-20);

  // Sort by timestamp to ensure correct order (oldest to newest)
  const sortedReadings = recentReadings.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  sortedReadings.forEach((reading, idx) => {
    chartData.push({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      timestamp: reading.timestamp,
      temp_actual: reading.temperature,
      hum_actual: reading.humidity,
      temp_predicted: null,
      hum_predicted: null,
      isCurrentAnomaly: reading.prediction === -1,
      isPrediction: false,
      index: idx,
    });
  });

  // Add prediction points for chart using backend's short_predictions (5-20 seconds)
  if (predictionData && predictionData.short_predictions && sortedReadings.length > 0) {
    const lastReading = sortedReadings[sortedReadings.length - 1];
    const isPredictedAnomaly = predictionData.anomaly_predicted;
    const lastTimestamp = new Date(lastReading.timestamp);

    // Add connecting point
    chartData.push({
      time: 'Now',
      timestamp: lastReading.timestamp,
      temp_actual: null,
      hum_actual: null,
      temp_predicted: lastReading.temperature,
      hum_predicted: lastReading.humidity,
      isCurrentAnomaly: false,
      isPredictiveAnomaly: false,
      isPrediction: true,
      index: chartData.length,
    });

    // Add prediction points from backend (5, 10, 15, 20 seconds ahead)
    predictionData.short_predictions.forEach((pred: any) => {
      // Calculate future timestamp (seconds ahead)
      const futureTime = new Date(lastTimestamp.getTime() + pred.timeframe_seconds * 1000);

      chartData.push({
        time: futureTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        timestamp: futureTime.toISOString(),
        temp_actual: null,
        hum_actual: null,
        temp_predicted: pred.predicted_temp,
        hum_predicted: pred.predicted_humidity,
        isCurrentAnomaly: false,
        isPredictiveAnomaly: isPredictedAnomaly,
        isPrediction: true,
        index: chartData.length,
      });
    });
  }

  // Calculate stable Y-axis domain with fixed padding
  const allTemps = chartData
    .map(d => d.temp_actual || d.temp_predicted)
    .filter(t => t !== null) as number[];
  const allHums = chartData
    .map(d => d.hum_actual || d.hum_predicted)
    .filter(h => h !== null) as number[];

  // Round to nearest 5 for stability
  const minTemp = Math.floor(Math.min(...allTemps) / 5) * 5 - 5;
  const maxTemp = Math.ceil(Math.max(...allTemps) / 5) * 5 + 5;
  const minHum = Math.floor(Math.min(...allHums) / 5) * 5 - 5;
  const maxHum = Math.ceil(Math.max(...allHums) / 5) * 5 + 5;
  const yMin = Math.min(minTemp, minHum, 0);
  const yMax = Math.max(maxTemp, maxHum, 100);

  const anomalies = liveData.filter(r => r.prediction === -1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const temp = data.temp_actual || data.temp_predicted;
      const hum = data.hum_actual || data.hum_predicted;
      const isActual = data.temp_actual !== null;

      return (
        <div className="bg-white/95 backdrop-blur p-4 rounded-lg shadow-xl border border-green-200">
          <p className="font-bold text-gray-900 mb-2">{data.time}</p>

          {/* Show "Actual" or "Forecast" badge */}
          <div className="mb-2">
            <span className={`text-xs px-2 py-1 rounded ${
              isActual
                ? 'bg-gray-100 text-gray-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {isActual ? 'ACTUAL DATA' : 'FORECAST'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-gray-600">Temperature:</span>
              <span className="text-sm font-bold text-orange-600">{temp?.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-gray-600">Humidity:</span>
              <span className="text-sm font-bold text-blue-600">{hum?.toFixed(1)}%</span>
            </div>
          </div>
          {data.isCurrentAnomaly && (
            <div className="mt-3 pt-2 border-t bg-red-50 -m-4 mb-0 p-3 rounded-b-lg">
              <p className="text-xs font-bold text-red-700">ANOMALY DETECTED</p>
            </div>
          )}
          {data.isPredictiveAnomaly && (
            <div className="mt-3 pt-2 border-t bg-orange-50 -m-4 mb-0 p-3 rounded-b-lg">
              <p className="text-xs font-bold text-orange-700">ANOMALY FORECAST</p>
            </div>
          )}
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

        {trainingStatus && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            trainingStatus.isTraining
              ? 'bg-blue-50 border-blue-300'
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="flex items-center gap-3">
              {trainingStatus.isTraining ? (
                <Loader className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div className="flex-1">
                <span className={`font-semibold ${
                  trainingStatus.isTraining ? 'text-blue-900' : 'text-green-900'
                }`}>
                  {trainingStatus.message}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-2.5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Total Rooms</p>
                <p className="text-lg font-bold text-gray-900">{loading ? '...' : stats.totalRooms}</p>
              </div>
              <Server className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-2.5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Active Sensors</p>
                <p className="text-lg font-bold text-gray-900">{loading ? '...' : stats.activeSensors}</p>
              </div>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-2.5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Active Alerts</p>
                <p className="text-lg font-bold text-gray-900">{loading ? '...' : stats.activeAlerts}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>

          {predictionData && sortedReadings.length > 1 && (
            <div className="bg-white rounded-lg shadow p-2.5 border border-green-200 lg:col-span-1">
              <div className="mb-1">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-600 font-semibold">Trend Analysis</p>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Temp Δ/s:</span>
                    <span className={`font-bold ${predictionData.trend.temp_delta_per_second > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {predictionData.trend.temp_delta_per_second > 0 ? '+' : ''}
                      {predictionData.trend.temp_delta_per_second.toFixed(4)}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hum Δ/s:</span>
                    <span className={`font-bold ${predictionData.trend.humidity_delta_per_second > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {predictionData.trend.humidity_delta_per_second > 0 ? '+' : ''}
                      {predictionData.trend.humidity_delta_per_second.toFixed(4)}%
                    </span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart
                  data={sortedReadings.slice(-10).map((reading, idx, arr) => {
                    const tempDelta = idx > 0 ? reading.temperature - arr[idx - 1].temperature : 0;
                    const humDelta = idx > 0 ? reading.humidity - arr[idx - 1].humidity : 0;
                    return {
                      tempDelta: tempDelta,
                      humDelta: humDelta,
                    };
                  })}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
                  <Line
                    type="monotone"
                    dataKey="tempDelta"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="humDelta"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sensor:</label>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {availableSensors.map(sensor => (
                <option key={sensor} value={sensor}>{sensor}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThresholdSettings(!showThresholdSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium transition"
            >
              <Settings className="w-4 h-4" />
              Threshold Settings
            </button>
            {predictedAnomaly && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                <span className="text-sm font-bold text-red-900">ANOMALY PREDICTED</span>
              </div>
            )}
          </div>
        </div>

        {showThresholdSettings && (
          <Card className="mb-6 border-2 border-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">Threshold Settings</CardTitle>
              <CardDescription>Set limits for temperature and humidity predictions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">Temperature Thresholds (°C)</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Maximum Temperature</label>
                    <input
                      type="number"
                      value={thresholds.maxTemp}
                      onChange={(e) => setThresholds({ ...thresholds, maxTemp: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Temperature</label>
                    <input
                      type="number"
                      value={thresholds.minTemp}
                      onChange={(e) => setThresholds({ ...thresholds, minTemp: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-gray-700 mb-3">Humidity Thresholds (%)</h3>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Maximum Humidity</label>
                    <input
                      type="number"
                      value={thresholds.maxHumidity}
                      onChange={(e) => setThresholds({ ...thresholds, maxHumidity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Humidity</label>
                    <input
                      type="number"
                      value={thresholds.minHumidity}
                      onChange={(e) => setThresholds({ ...thresholds, minHumidity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {thresholdAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {thresholdAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-300 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Threshold Violation Forecast</div>
                  <p className="text-sm text-gray-700 mt-1">{alert}</p>
                  <p className="text-xs text-gray-500 mt-1">Forecasted within next hour</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Card className="mb-6 border border-green-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Environmental Monitoring</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Real-time data with 5-20 second ML forecast</CardDescription>
              </div>
              {predictionData?.anomaly_predicted && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Anomaly Forecast</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-gray-50">
            {chartData.length > 0 ? (
              <div>
                {predictionData && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">ML Model Metrics</h3>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="Confidence is calculated based on the magnitude of predicted changes. Higher changes indicate higher confidence in anomaly detection."
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Trend Analysis</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {predictionData.trend.temp_delta_per_reading > 0 ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="text-sm text-gray-700">
                              Temperature: <span className="font-semibold">{predictionData.trend.temp_delta_per_reading > 0 ? '+' : ''}{predictionData.trend.temp_delta_per_reading.toFixed(3)}°C/reading</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {predictionData.trend.humidity_delta_per_reading > 0 ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="text-sm text-gray-700">
                              Humidity: <span className="font-semibold">{predictionData.trend.humidity_delta_per_reading > 0 ? '+' : ''}{predictionData.trend.humidity_delta_per_reading.toFixed(3)}%/reading</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Prediction Confidence</div>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${(predictionData.confidence || 0) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-bold text-lg">{((predictionData.confidence || 0) * 100).toFixed(1)}%</span>
                            <span className="text-xs text-gray-500 ml-2">Based on change magnitude</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Anomaly Status</div>
                        <div className="flex items-center gap-2">
                          {predictionData.anomaly_predicted ? (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-semibold text-red-600">Anomaly Predicted</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-semibold text-green-600">Normal Behavior</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {predictionData.message}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded-lg shadow">
                  <ResponsiveContainer width="100%" height={600}>
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <defs>
                        <linearGradient id="tempActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="humActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="tempPredicted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="humPredicted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }}
                        angle={-35}
                        textAnchor="end"
                        height={80}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        domain={[yMin, yMax]}
                        tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }}
                        stroke="#9ca3af"
                        label={{ value: 'Temperature (°C) / Humidity (%)', angle: -90, position: 'insideLeft', fill: '#374151', fontSize: 13, fontWeight: 600 }}
                      />
                      <Tooltip content={<CustomTooltip />} />

                      {/* Threshold lines */}
                      <ReferenceLine
                        y={thresholds.maxTemp}
                        stroke="#f97316"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        opacity={0.6}
                        label={{ value: `Max Temp: ${thresholds.maxTemp}°C`, position: 'right', fill: '#f97316', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <ReferenceLine
                        y={thresholds.minTemp}
                        stroke="#f97316"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        opacity={0.6}
                        label={{ value: `Min Temp: ${thresholds.minTemp}°C`, position: 'right', fill: '#f97316', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <ReferenceLine
                        y={thresholds.maxHumidity}
                        stroke="#3b82f6"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        opacity={0.6}
                        label={{ value: `Max Hum: ${thresholds.maxHumidity}%`, position: 'left', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <ReferenceLine
                        y={thresholds.minHumidity}
                        stroke="#3b82f6"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        opacity={0.6}
                        label={{ value: `Min Hum: ${thresholds.minHumidity}%`, position: 'left', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}
                      />

                      {/* Actual data */}
                      <Area
                        type="monotone"
                        dataKey="temp_actual"
                        stroke="#f97316"
                        strokeWidth={4}
                        fill="url(#tempActual)"
                        dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        connectNulls={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="hum_actual"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fill="url(#humActual)"
                        dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8 }}
                        connectNulls={false}
                      />

                      {/* Predicted data - using lines instead of areas */}
                      <Line
                        type="monotone"
                        dataKey="temp_predicted"
                        stroke="#a855f7"
                        strokeWidth={4}
                        strokeDasharray="8 4"
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (!payload.isPrediction) return null;
                          if (payload.isPredictiveAnomaly) {
                            return <circle cx={cx} cy={cy} r={8} fill="#ef4444" stroke="#fff" strokeWidth={3} />;
                          }
                          return <circle cx={cx} cy={cy} r={6} fill="#a855f7" stroke="#fff" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="hum_predicted"
                        stroke="#ec4899"
                        strokeWidth={4}
                        strokeDasharray="8 4"
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (!payload.isPrediction) return null;
                          if (payload.isPredictiveAnomaly) {
                            return <circle cx={cx} cy={cy} r={8} fill="#ef4444" stroke="#fff" strokeWidth={3} />;
                          }
                          return <circle cx={cx} cy={cy} r={6} fill="#ec4899" stroke="#fff" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8 }}
                        connectNulls={false}
                      />

                      {/* Vertical line marking current time */}
                      <ReferenceLine
                        x="Now"
                        stroke="#10b981"
                        strokeWidth={2}
                        label={{ value: 'Current Time', position: 'top', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-gray-400 bg-white rounded-lg">
                <div className="text-center">
                  <Activity className="w-20 h-20 mx-auto mb-4 opacity-30 animate-pulse" />
                  <p className="text-lg font-medium">Loading sensor data...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PREDICTION VALIDATION - ONE TABLE + TWO CHARTS */}
        {pendingValidations.length > 0 && (() => {
          const filteredData = pendingValidations.slice(0, 5);

          return (
            <Card className="mb-6 border border-gray-200 shadow">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">Latest Predictions</CardTitle>
                <CardDescription className="text-gray-600">Last 5 predictions updating live</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">

                {/* TWO CHARTS - Temperature and Humidity */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Temperature Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h5 className="text-xs font-bold text-gray-900 mb-2">Temperature (°C)</h5>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={filteredData.slice().reverse().map(pred => ({
                          time: new Date(pred.timestamp).toLocaleTimeString(),
                          predicted: pred.predicted_temp,
                          actual: pred.current_temp,
                        }))}
                        margin={{ top: 5, right: 5, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" name="Predicted" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Humidity Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h5 className="text-xs font-bold text-gray-900 mb-2">Humidity (%)</h5>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={filteredData.slice().reverse().map(pred => ({
                          time: new Date(pred.timestamp).toLocaleTimeString(),
                          predicted: pred.predicted_humidity,
                          actual: pred.current_humidity,
                        }))}
                        margin={{ top: 5, right: 5, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" name="Predicted" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-800">Time</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Pred Temp</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Act Temp</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Diff</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Pred Hum</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Act Hum</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Diff</th>
                        <th className="text-center py-2 px-2 font-semibold text-gray-800">Anom</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((pred, idx) => {
                        const tempDiff = Math.abs(pred.current_temp - pred.predicted_temp);
                        const humDiff = Math.abs(pred.current_humidity - pred.predicted_humidity);

                        return (
                          <tr key={pred.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-2 px-2 text-gray-900">{new Date(pred.timestamp).toLocaleTimeString()}</td>
                            <td className="py-2 px-2 text-center text-gray-900">{pred.predicted_temp.toFixed(1)}</td>
                            <td className="py-2 px-2 text-center text-gray-900">{pred.current_temp.toFixed(1)}</td>
                            <td className="py-2 px-2 text-center text-gray-900">{tempDiff.toFixed(2)}</td>
                            <td className="py-2 px-2 text-center text-gray-900">{pred.predicted_humidity.toFixed(1)}</td>
                            <td className="py-2 px-2 text-center text-gray-900">{pred.current_humidity.toFixed(1)}</td>
                            <td className="py-2 px-2 text-center text-gray-900">{humDiff.toFixed(2)}</td>
                            <td className="py-2 px-2 text-center">
                              {pred.anomaly ? (
                                <span className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">Y</span>
                              ) : (
                                <span className="px-1 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">N</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
