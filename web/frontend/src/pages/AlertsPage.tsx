import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, CheckCircle, Clock, ThermometerSun, Droplets } from 'lucide-react';
import { alertService } from '../api/services/alert.service';
import apiClient from '../api/client';
import type { Alert } from '../types';
import Button from '../components/ui/Button';

const AlertsPage: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sensorNames, setSensorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const [active, history] = await Promise.all([
        alertService.getActiveAlerts(),
        alertService.getAlertHistory(20)
      ]);

      setActiveAlerts(active);
      setAlertHistory(history);

      // Fetch sensor names for alerts
      // sensor_id in alerts matches the node_id which is the sensor.id (VARCHAR)
      const sensorIds = [...new Set([...active, ...history].map(a => a.sensor_id))];
      const names: Record<string, string> = {};
      for (const id of sensorIds) {
        // Fetch sensor by its string ID directly via API
        try {
          const response = await apiClient.get(`/api/v1/sensors/sensor/${id}`);
          names[id] = response.data.name;
        } catch {
          names[id] = `Node ${id}`;
        }
      }
      setSensorNames(names);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertService.acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to acknowledge alert');
    }
  };

  const handleFeedback = async (alertId: number, feedbackType: 'false_positive' | 'true_positive') => {
    try {
      await alertService.submitFeedback(alertId, feedbackType);
      fetchAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit feedback');
    }
  };

  const getAlertIcon = (type: string) => {
    if (type === 'temperature') {
      return <ThermometerSun className="w-5 h-5" />;
    }
    return <Droplets className="w-5 h-5" />;
  };

  const getAlertColor = (type: string) => {
    return type === 'temperature' ? 'orange' : 'blue';
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alerts</h1>
          <p className="text-gray-600">Monitor and manage environmental alerts</p>
        </div>

        {/* Active Alerts */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span>Active Alerts</span>
                </CardTitle>
                <CardDescription>Alerts requiring immediate attention</CardDescription>
              </div>
              <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading alerts...</p>
            ) : activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.map((alert) => {
                  const color = getAlertColor(alert.alert_type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 bg-${color}-50 border border-${color}-200 rounded-lg flex items-start justify-between`}
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 bg-${color}-100 rounded-lg text-${color}-600`}>
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {sensorNames[alert.sensor_id] || `Sensor ${alert.sensor_id}`}
                          </h4>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                          {alert.feedback && (
                            <p className="text-xs mt-1 text-gray-500">
                              Feedback: {alert.feedback.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {!alert.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {!alert.feedback && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFeedback(alert.id, 'false_positive')}
                            >
                              False Alarm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFeedback(alert.id, 'true_positive')}
                            >
                              Confirm
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear</h3>
                <p className="text-gray-600">No active alerts at this time</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alert History</CardTitle>
            <CardDescription>Past 20 alerts (including acknowledged)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading history...</p>
            ) : alertHistory.length > 0 ? (
              <div className="space-y-2">
                {alertHistory.map((alert) => {
                  const color = getAlertColor(alert.alert_type);
                  return (
                    <div
                      key={alert.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-${color}-100 rounded text-${color}-600`}>
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {sensorNames[alert.sensor_id] || `Sensor ${alert.sensor_id}`} - {alert.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {alert.acknowledged && (
                        <div className="flex items-center space-x-1 text-green-600 text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>Acknowledged</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No alert history</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
