import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../hooks/useRooms';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Activity, Trash2, Plus, X, Thermometer, Droplets } from 'lucide-react';
import { sensorService } from '../api/services/sensor.service';
import { dataService } from '../api/services/data.service';
import type { Sensor, SensorData } from '../types';

const SensorsPage: React.FC = () => {
  const { user } = useAuth();
  const { rooms } = useRooms(user?.id || null);
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorData, setSensorData] = useState<Record<string, SensorData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'ESP32',
    room_id: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllSensors();
  }, [rooms]);

  useEffect(() => {
    if (sensors.length > 0) {
      fetchSensorData();
      const interval = setInterval(fetchSensorData, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [sensors]);

  const fetchAllSensors = async () => {
    if (!rooms || rooms.length === 0) return;

    setIsLoading(true);
    try {
      const allSensors: Sensor[] = [];
      for (const room of rooms) {
        try {
          const roomSensors = await sensorService.listSensorsByRoom(room.id);
          allSensors.push(...roomSensors);
        } catch (err) {
          console.error(`Error fetching sensors for room ${room.id}:`, err);
        }
      }
      setSensors(allSensors);
    } catch (err) {
      console.error('Error fetching sensors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSensorData = async () => {
    if (sensors.length === 0) return;

    try {
      const nodeIds = sensors.map(s => s.id.toString());
      const data = await dataService.getMultiSensorData(nodeIds);
      setSensorData(data);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    }
  };

  const handleCreateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.room_id) {
      setError('All fields are required');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await sensorService.createSensor({
        id: parseInt(formData.id),
        name: formData.name,
        type: formData.type,
        room_id: parseInt(formData.room_id),
      });
      setFormData({ id: '', name: '', type: 'ESP32', room_id: '' });
      setShowCreateModal(false);
      fetchAllSensors();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create sensor');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSensor = async (sensorId: number, sensorName: string) => {
    if (!confirm(`Are you sure you want to delete sensor "${sensorName}"?`)) {
      return;
    }

    try {
      await sensorService.deleteSensor(sensorId);
      fetchAllSensors();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete sensor');
    }
  };

  const getRoomName = (roomId: number) => {
    const room = rooms?.find(r => r.id === roomId);
    return room?.name || `Room ${roomId}`;
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sensors</h1>
            <p className="text-gray-600">Monitor and manage your ESP32 sensor nodes</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
            disabled={!rooms || rooms.length === 0}
          >
            <Plus className="w-4 h-4" />
            <span>New Sensor</span>
          </Button>
        </div>

        {!rooms || rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms available</h3>
              <p className="text-gray-600 mb-4">Create a server room first before adding sensors</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading sensors...</p>
          </div>
        ) : sensors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sensors.map((sensor) => {
              const data = sensorData[sensor.id.toString()];
              return (
                <Card
                  key={sensor.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/sensors/${sensor.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{sensor.name}</CardTitle>
                          <CardDescription>{getRoomName(sensor.room_id)}</CardDescription>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSensor(sensor.id, sensor.name);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete sensor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {data ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-5 h-5 text-orange-600" />
                            <span className="text-sm text-gray-600">Temperature</span>
                          </div>
                          <span className="text-lg font-bold text-orange-600">
                            {data.temperature.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Droplets className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600">Humidity</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {data.humidity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Last updated: {new Date(data.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sensors yet</h3>
              <p className="text-gray-600 mb-4">Register your first ESP32 sensor to start monitoring</p>
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 mx-auto">
                <Plus className="w-4 h-4" />
                <span>Register Sensor</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Sensor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Register New Sensor</CardTitle>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSensor} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="sensorId">Sensor ID (Node ID)</Label>
                    <Input
                      id="sensorId"
                      type="text"
                      placeholder="e.g., 20e7c89f14ec"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      required
                      disabled={creating}
                    />
                    <p className="text-xs text-gray-500 mt-1">The unique hardware ID from your ESP32</p>
                  </div>
                  <div>
                    <Label htmlFor="sensorName">Sensor Name</Label>
                    <Input
                      id="sensorName"
                      type="text"
                      placeholder="e.g., Temperature Sensor 1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sensorType">Sensor Type</Label>
                    <Input
                      id="sensorType"
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      disabled={creating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomId">Server Room</Label>
                    <select
                      id="roomId"
                      value={formData.room_id}
                      onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                      required
                      disabled={creating}
                    >
                      <option value="">Select a room...</option>
                      {rooms?.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating ? 'Registering...' : 'Register Sensor'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SensorsPage;
