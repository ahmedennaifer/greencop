import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const AlertsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Alerts</h1>
        <p className="text-gray-600 mb-8">Manage your alert notifications</p>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Alert management interface</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
