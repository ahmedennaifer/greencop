import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const RoomsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Server Rooms</h1>
        <p className="text-gray-600 mb-8">Manage your server rooms</p>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Server room management interface</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RoomsPage;
