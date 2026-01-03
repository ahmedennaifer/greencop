import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FlaskConical, CheckCircle, Clock, AlertCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

type SortField = 'id' | 'started_at' | 'f1_score' | 'accuracy' | 'rmse_temp' | 'validated_data_count';
type SortDirection = 'asc' | 'desc';

const ModelsPage: React.FC = () => {
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFailedPane, setShowFailedPane] = useState(false);

  useEffect(() => {
    fetchTrainingHistory();
    const interval = setInterval(fetchTrainingHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrainingHistory = async () => {
    try {
      const response = await apiClient.get('/api/v1/ml/retraining/history?limit=100');
      setTrainingRuns(response.data);
    } catch (err) {
      console.error('Error fetching training history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" />Completed</span>;
      case 'running':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5 animate-spin" />Running</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"><AlertCircle className="w-3.5 h-3.5" />Failed</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getMetricValue = (run: TrainingRun, field: SortField): number => {
    if (field === 'id') return run.id;
    if (field === 'started_at') return new Date(run.started_at).getTime();
    if (field === 'validated_data_count') return run.validated_data_count || 0;

    if (!run.metrics) return 0;

    if (field === 'f1_score') {
      return run.metrics.anomaly?.f1_score || run.metrics.f1_score || 0;
    }
    if (field === 'accuracy') {
      return run.metrics.anomaly?.accuracy || run.metrics.accuracy || 0;
    }
    if (field === 'rmse_temp') {
      return run.metrics.forecasting?.rmse_temp || 0;
    }

    return 0;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const filteredAndSortedRuns = trainingRuns
    .filter(run => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        run.id.toString().includes(search) ||
        run.model_version?.toLowerCase().includes(search) ||
        run.triggered_by.toLowerCase().includes(search) ||
        run.status.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const aVal = getMetricValue(a, sortField);
      const bVal = getMetricValue(b, sortField);
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const completedRuns = filteredAndSortedRuns.filter(run => run.status === 'completed' || run.status === 'running');
  const failedRuns = filteredAndSortedRuns.filter(run => run.status === 'failed');

  const renderModelCard = (run: TrainingRun) => (
    <Card key={run.id} className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl font-bold text-gray-900">
                Run #{run.id}
              </CardTitle>
              {getStatusBadge(run.status)}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatDate(run.started_at)}</span>
              </div>
              {run.completed_at && run.status === 'completed' && (
                <span className="text-green-700 font-medium">
                  • Completed in {Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s
                </span>
              )}
            </div>
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
            {run.triggered_by.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Training Data Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Rows</p>
              <p className="text-2xl font-bold text-blue-900">{run.training_data_count?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Validated</p>
              <p className="text-2xl font-bold text-green-900">{run.validated_data_count || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Model Type</p>
              <p className="text-2xl font-bold text-purple-900 capitalize">{run.model_type}</p>
            </div>
          </div>

          {/* Model Version */}
          {run.model_version && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-gray-600" />
                Model Version
              </h4>
              <p className="text-sm font-mono text-gray-800 break-all leading-relaxed">{run.model_version}</p>
            </div>
          )}

          {/* Metrics */}
          {run.metrics && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
                Performance Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {run.metrics.anomaly && (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Anomaly F1</p>
                      <p className="text-xl font-bold text-blue-900">{(run.metrics.anomaly.f1_score ?? run.metrics.f1_score ?? 0).toFixed(3)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Accuracy</p>
                      <p className="text-xl font-bold text-blue-900">{(run.metrics.anomaly.accuracy ?? run.metrics.accuracy ?? 0).toFixed(3)}</p>
                    </div>
                  </>
                )}
                {run.metrics.forecasting && (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">RMSE (Temp)</p>
                      <p className="text-xl font-bold text-green-900">{(run.metrics.forecasting.rmse_temp ?? 0).toFixed(2)}°C</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">MAE (Hum)</p>
                      <p className="text-xl font-bold text-green-900">{(run.metrics.forecasting.mae_humidity ?? 0).toFixed(2)}%</p>
                    </div>
                  </>
                )}
                {!run.metrics.anomaly && !run.metrics.forecasting && run.metrics.f1_score && (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">F1 Score</p>
                      <p className="text-xl font-bold text-blue-900">{run.metrics.f1_score?.toFixed(3)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Accuracy</p>
                      <p className="text-xl font-bold text-blue-900">{run.metrics.accuracy?.toFixed(3)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {run.error_message && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error Details
              </h4>
              <p className="text-sm text-red-700 font-mono leading-relaxed">{run.error_message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FlaskConical className="w-10 h-10 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">ML Models</h1>
            </div>
            <p className="text-gray-600 mt-1 ml-13">Training history and model versions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Runs</p>
            <p className="text-3xl font-bold text-gray-900">{trainingRuns.length}</p>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, version, trigger, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSort('id')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                ID {getSortIcon('id')}
              </button>
              <button
                onClick={() => handleSort('started_at')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Date {getSortIcon('started_at')}
              </button>
              <button
                onClick={() => handleSort('f1_score')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                F1 Score {getSortIcon('f1_score')}
              </button>
              <button
                onClick={() => handleSort('accuracy')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Accuracy {getSortIcon('accuracy')}
              </button>
              <button
                onClick={() => handleSort('validated_data_count')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Validated {getSortIcon('validated_data_count')}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <FlaskConical className="w-16 h-16 mx-auto text-purple-600 mb-4 animate-pulse" />
            <p className="text-gray-600 text-lg">Loading training history...</p>
          </div>
        ) : (
          <>
            {/* Failed Models Pane */}
            {failedRuns.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowFailedPane(!showFailedPane)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <h2 className="text-lg font-bold text-red-900">
                      Failed Training Runs ({failedRuns.length})
                    </h2>
                  </div>
                  {showFailedPane ? (
                    <ChevronUp className="w-5 h-5 text-red-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-red-600" />
                  )}
                </button>

                {showFailedPane && (
                  <div className="px-6 pb-6 space-y-4">
                    {failedRuns.map(renderModelCard)}
                  </div>
                )}
              </div>
            )}

            {/* Successful Models */}
            <div className="space-y-4">
              {completedRuns.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FlaskConical className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">No training runs found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm ? 'Try adjusting your search filters' : 'Training runs will appear here'}
                  </p>
                </div>
              ) : (
                completedRuns.map(renderModelCard)
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModelsPage;
