import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import apiClient from '../api/client';

interface TrainingRun {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: string;
  model_type: string;
  training_data_count: number;
  validated_data_count: number;
  metrics: any;
  model_version: string | null;
  triggered_by: string;
  error_message: string | null;
}

const ModelsPage: React.FC = () => {
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingHistory();
    const interval = setInterval(fetchTrainingHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrainingHistory = async () => {
    try {
      const response = await apiClient.get('/api/v1/ml/retraining/history?limit=20');
      setTrainingRuns(response.data);
    } catch (err) {
      console.error('Error fetching training history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" />Completed</span>;
      case 'running':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"><Clock className="w-3 h-3 animate-spin" />Running</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium"><AlertCircle className="w-3 h-3" />Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ML Models</h1>
            <p className="text-gray-600 mt-1">Training history and model versions</p>
          </div>
          <Brain className="w-10 h-10 text-blue-600" />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading training history...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trainingRuns.map((run) => (
              <Card key={run.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Run #{run.id}
                        {getStatusBadge(run.status)}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Started: {formatDate(run.started_at)}
                        {run.completed_at && ` • Completed: ${formatDate(run.completed_at)}`}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {run.triggered_by.replace(/_/g, ' ')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Training Data</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Total rows:</span> <span className="font-medium">{run.training_data_count?.toLocaleString() || 'N/A'}</span></p>
                        <p><span className="text-gray-600">Validated predictions:</span> <span className="font-medium">{run.validated_data_count || 0}</span></p>
                        <p><span className="text-gray-600">Model type:</span> <span className="font-medium">{run.model_type}</span></p>
                      </div>
                    </div>

                    {run.model_version && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Model Version</h4>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{run.model_version}</p>
                      </div>
                    )}

                    {run.metrics && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-700 mb-2">Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {run.metrics.anomaly && (
                            <>
                              <div className="bg-blue-50 p-3 rounded">
                                <p className="text-gray-600 text-xs">Anomaly F1</p>
                                <p className="font-bold text-blue-900">{(run.metrics.anomaly.f1_score || run.metrics.f1_score)?.toFixed(3)}</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded">
                                <p className="text-gray-600 text-xs">Accuracy</p>
                                <p className="font-bold text-blue-900">{(run.metrics.anomaly.accuracy || run.metrics.accuracy)?.toFixed(3)}</p>
                              </div>
                            </>
                          )}
                          {run.metrics.forecasting && (
                            <>
                              <div className="bg-green-50 p-3 rounded">
                                <p className="text-gray-600 text-xs">Forecast RMSE (Temp)</p>
                                <p className="font-bold text-green-900">{run.metrics.forecasting.rmse_temp?.toFixed(2)}°C</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <p className="text-gray-600 text-xs">Forecast MAE (Hum)</p>
                                <p className="font-bold text-green-900">{run.metrics.forecasting.mae_humidity?.toFixed(2)}%</p>
                              </div>
                            </>
                          )}
                          {!run.metrics.anomaly && !run.metrics.forecasting && run.metrics.f1_score && (
                            <>
                              <div className="bg-blue-50 p-3 rounded">
                                <p className="text-gray-600 text-xs">F1 Score</p>
                                <p className="font-bold text-blue-900">{run.metrics.f1_score?.toFixed(3)}</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded">
                                <p className="text-gray-600 text-xs">Accuracy</p>
                                <p className="font-bold text-blue-900">{run.metrics.accuracy?.toFixed(3)}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {run.error_message && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-red-700 mb-2">Error</h4>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{run.error_message}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModelsPage;
