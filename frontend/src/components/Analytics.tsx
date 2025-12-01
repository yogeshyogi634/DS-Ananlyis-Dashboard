import React, { useState, useEffect } from 'react';
import type { DesignSystem, Analysis, AnalysisMetrics } from '../types/index';
import { designSystemsApi, analysisApi } from '../services/api';
import { BarChart3, TrendingUp, Calendar, FileText } from 'lucide-react';

const Analytics: React.FC = () => {
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchDesignSystems();
  }, []);

  useEffect(() => {
    if (selectedSystem) {
      fetchAnalytics();
    }
  }, [selectedSystem, timeRange]);

  const fetchDesignSystems = async () => {
    try {
      const systems = await designSystemsApi.getAll();
      setDesignSystems(systems);
      if (systems.length > 0 && !selectedSystem) {
        setSelectedSystem(systems[0].id);
      }
    } catch (error) {
      console.error('Error fetching design systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedSystem) return;

    try {
      setLoading(true);
      const [analysesData, metricsData] = await Promise.all([
        analysisApi.getByDesignSystem(selectedSystem, { page: 1, limit: 10 }),
        analysisApi.getMetrics(selectedSystem, { days: timeRange }),
      ]);
      
      setAnalyses(analysesData.analyses || []);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading && designSystems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Design system compliance insights</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          {designSystems.length > 1 && (
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {designSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {designSystems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Analytics Available
          </h3>
          <p className="text-gray-600">
            Add design systems and run analyses to see insights here
          </p>
        </div>
      ) : (
        <>
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Average Compliance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {metrics.avgCompliance.toFixed(1)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Analyses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {metrics.totalAnalyses}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Date Range
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(metrics.dateRange.start).toLocaleDateString()} - {new Date(metrics.dateRange.end).toLocaleDateString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Analyses</h3>
              </div>
              <div className="p-6">
                {analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No analyses found for this time period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{analysis.frameName}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(analysis.compliancePercentage)}`}>
                            {analysis.compliancePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Elements:</span>
                            <span className="ml-2 font-medium">{analysis.totalElements}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Compliant:</span>
                            <span className="ml-2 font-medium">{analysis.dsCompliantElements}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {metrics && metrics.complianceOverTime.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Compliance Trend</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {metrics.complianceOverTime.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {item.frameName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.compliance >= 80 ? 'bg-green-500' :
                                item.compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.compliance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {item.compliance.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;