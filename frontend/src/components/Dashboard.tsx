import React, { useState, useEffect } from "react";
import type { DesignSystem, AnalysisMetrics } from "../types/index";
import { designSystemsApi, analysisApi } from "../services/api";
import { BarChart3, Palette, FileText, TrendingUp } from "lucide-react";

const Dashboard: React.FC = () => {
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesignSystems();
  }, []);

  useEffect(() => {
    if (selectedSystem) {
      fetchMetrics(selectedSystem);
    }
  }, [selectedSystem]);

  const fetchDesignSystems = async () => {
    try {
      const systems = await designSystemsApi.getAll();
      setDesignSystems(systems);
      if (systems.length > 0 && !selectedSystem) {
        setSelectedSystem(systems[0].id);
      }
    } catch (error) {
      console.error("Error fetching design systems:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (systemId: string) => {
    try {
      setLoading(true);
      const metricsData = await analysisApi.getMetrics(systemId);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSystemData = designSystems.find(
    (ds) => ds.id === selectedSystem
  );

  if (loading && designSystems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Design System Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor and analyze design system compliance across your Figma
          projects
        </p>
      </div>

      {designSystems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Design Systems Found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first design system from Figma
          </p>
          <a
            href="/design-systems"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Design System
          </a>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Design System
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {designSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSystemData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Palette className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Components
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {selectedSystemData._count.components}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">C</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Colors
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {selectedSystemData._count.colors}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Typography
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {selectedSystemData._count.typography}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Analyses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {selectedSystemData._count.analyses}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Average Compliance
                  </h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {metrics.avgCompliance.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  Across {metrics.totalAnalyses} analyses
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Analyses
                </h3>
                <div className="space-y-3">
                  {metrics.complianceOverTime.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.frameName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${
                            item.compliance >= 80
                              ? "text-green-600"
                              : item.compliance >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.compliance.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
