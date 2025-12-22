import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Brain, AlertTriangle, Activity, ThumbsUp, ThumbsDown } from 'lucide-react';
import apiClient from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';

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

interface FeedbackData {
  [key: string]: 'correct' | 'incorrect' | null;
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
  const [feedback, setFeedback] = useState<FeedbackData>({});
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    fetchMLData();
    const interval = setInterval(fetchMLData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMLData = async () => {
    try {
      const response = await apiClient.get('/api/v1/data/recent', {
        params: { limit: 100 }
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

  const handleFeedback = async (timestamp: string, isCorrect: boolean) => {
    setFeedbackSubmitting(true);
    try {
      await apiClient.post('/api/v1/feedback', {
        timestamp,
        feedback: isCorrect ? 'correct' : 'incorrect'
      });
      setFeedback(prev => ({ ...prev, [timestamp]: isCorrect ? 'correct' : 'incorrect' }));
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const chartData = recentReadings
    .slice()
    .reverse()
    .map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString(),
      timestamp: reading.timestamp,
      temperature: reading.temperature,
      humidity: reading.humidity,
      isAnomaly: reading.prediction === -1,
      prediction: reading.prediction
    }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isAnomaly) {
      return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="red" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="6" />
        </svg>
      );
    }
    return null;
  };

  const anomalies = recentReadings.filter(r => r.prediction === -1);

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ML Anomaly Detection</h1>
          <p className="text-gray-600">Real-time machine learning predictions and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Predictions</CardTitle>
              <Brain className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mlStats.total_predictions}</div>
              <p className="text-xs text-gray-500">Last 100 readings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Anomalies Detected</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
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
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Temperature Trend</CardTitle>
            <CardDescription>Real-time temperature monitoring with anomaly detection</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading data...</p>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={50} stroke="red" strokeDasharray="3 3" label="Threshold" />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                    dot={<CustomDot />}
                    strokeWidth={2}
                    name="Temperature"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Humidity Trend</CardTitle>
            <CardDescription>Real-time humidity monitoring with anomaly detection</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading data...</p>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={50} stroke="red" strokeDasharray="3 3" label="Threshold" />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#82ca9d"
                    dot={<CustomDot />}
                    strokeWidth={2}
                    name="Humidity"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {anomalies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detected Anomalies</CardTitle>
              <CardDescription>Provide feedback to improve ML model accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.slice(0, 10).map((reading, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-900">Anomaly Detected</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Sensor:</span> {reading.node_id} |
                        <span className="font-medium"> Temp:</span> {reading.temperature}°C |
                        <span className="font-medium"> Humidity:</span> {reading.humidity}% |
                        <span className="font-medium"> Time:</span> {new Date(reading.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {feedback[reading.timestamp] === 'correct' ? (
                        <span className="text-xs text-green-600 font-medium">✓ Feedback sent</span>
                      ) : feedback[reading.timestamp] === 'incorrect' ? (
                        <span className="text-xs text-orange-600 font-medium">✓ Feedback sent</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleFeedback(reading.timestamp, true)}
                            disabled={feedbackSubmitting}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Correct
                          </button>
                          <button
                            onClick={() => handleFeedback(reading.timestamp, false)}
                            disabled={feedbackSubmitting}
                            className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Incorrect
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

export default MLDashboardPage;
