import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Thermometer, Droplets, Save, Settings as SettingsIcon } from 'lucide-react';
import { alertService } from '../api/services/alert.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState({
    max_temperature: 30,
    max_humidity: 70,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchThresholds();
  }, [user]);

  const fetchThresholds = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await alertService.getThresholds(user.id);
      setThresholds({
        max_temperature: data.max_temperature,
        max_humidity: data.max_humidity,
      });
    } catch (err) {
      console.error('Error fetching thresholds:', err);
      // Use defaults if not found
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await alertService.updateThresholds(user.id, thresholds);
      setSuccess('Alert thresholds updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update thresholds');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure alert thresholds and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Thresholds */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Alert Thresholds</span>
                </CardTitle>
                <CardDescription>
                  Set maximum values for temperature and humidity. You'll receive alerts when these limits are exceeded.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading settings...</p>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        {success}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <Thermometer className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Maximum Temperature</h3>
                            <p className="text-sm text-gray-600">Alert when temperature exceeds this value</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Label htmlFor="maxTemp">Temperature (°C)</Label>
                            <Input
                              id="maxTemp"
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={thresholds.max_temperature}
                              onChange={(e) =>
                                setThresholds({ ...thresholds, max_temperature: parseFloat(e.target.value) })
                              }
                              required
                              disabled={saving}
                            />
                          </div>
                          <div className="text-3xl font-bold text-orange-600 pt-6">
                            {thresholds.max_temperature}°C
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Droplets className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Maximum Humidity</h3>
                            <p className="text-sm text-gray-600">Alert when humidity exceeds this value</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Label htmlFor="maxHumidity">Humidity (%)</Label>
                            <Input
                              id="maxHumidity"
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={thresholds.max_humidity}
                              onChange={(e) =>
                                setThresholds({ ...thresholds, max_humidity: parseFloat(e.target.value) })
                              }
                              required
                              disabled={saving}
                            />
                          </div>
                          <div className="text-3xl font-bold text-blue-600 pt-6">
                            {thresholds.max_humidity}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving} className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Alerts Work</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <p>
                  When sensor readings exceed your configured thresholds, alerts are automatically generated and sent to your dashboard.
                </p>
                <p>
                  You can acknowledge alerts from the Alerts page to mark them as resolved.
                </p>
                <p className="font-medium text-gray-900">
                  Recommended Values:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Temperature: 25-30°C</li>
                  <li>Humidity: 40-70%</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <SettingsIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Real-time Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Your sensors are monitored continuously. Changes to thresholds take effect immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
