import React, { useState, useEffect } from "react";
import type { DesignSystem } from "../types/index";
import { designSystemsApi } from "../services/api";
import MissingElements from "./MissingElements";
import { AlertTriangle, Search } from "lucide-react";

const MissingElementsPage: React.FC = () => {
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesignSystems();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading missing elements...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Missing Design System Elements
          </h1>
        </div>
        <p className="text-gray-600">
          Discover elements used in your designs that are not part of your design system.
          Use this data to identify gaps and improve design consistency.
        </p>
      </div>

      {designSystems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Design Systems Found
          </h3>
          <p className="text-gray-600 mb-6">
            You need to have design systems set up to view missing elements analysis.
          </p>
          <a
            href="/design-systems"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Set Up Design Systems
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

          {selectedSystem && (
            <div className="space-y-6">
              {/* Info Panel */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900 mb-1">
                      How to use this data
                    </h3>
                    <p className="text-sm text-blue-800">
                      Missing elements indicate design patterns that appear frequently in your designs 
                      but are not standardized in your design system. Consider adding the most common 
                      missing elements to your design system to improve consistency and adoption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Missing Elements Display */}
              <MissingElements designSystemId={selectedSystem} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MissingElementsPage;