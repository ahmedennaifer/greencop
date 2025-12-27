import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useRooms } from '../hooks/useRooms';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Server, Trash2, Plus, X } from 'lucide-react';
import { extractErrorMessage } from '../utils/errorHandler';

const RoomsPage: React.FC = () => {
  const { user } = useAuth();
  const { rooms, isLoading, createRoom, deleteRoom, refetch } = useRooms(user?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await createRoom(roomName.trim());
      setRoomName('');
      setShowCreateModal(false);
      refetch();
    } catch (err: any) {
      setError(extractErrorMessage(err) || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: number, roomName: string) => {
    if (!confirm(`Are you sure you want to delete "${roomName}"? This will also delete all sensors in this room.`)) {
      return;
    }

    try {
      await deleteRoom(roomId);
      refetch();
    } catch (err: any) {
      alert(extractErrorMessage(err) || 'Failed to delete room');
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Server Rooms</h1>
            <p className="text-gray-600">Manage and organize your server rooms</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Room</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading rooms...</p>
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <Server className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{room.name}</CardTitle>
                        <CardDescription>Room ID: {room.id}</CardDescription>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRoom(room.id, room.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sensors:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No server rooms yet</h3>
              <p className="text-gray-600 mb-4">Create your first server room to get started</p>
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 mx-auto">
                <Plus className="w-4 h-4" />
                <span>Create Server Room</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Create New Server Room</CardTitle>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      type="text"
                      placeholder="e.g., Data Center 1"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                      disabled={creating}
                    />
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
                      {creating ? 'Creating...' : 'Create Room'}
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

export default RoomsPage;
