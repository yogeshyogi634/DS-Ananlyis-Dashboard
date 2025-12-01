import React, { useState, useEffect } from 'react';
import type { DesignSystem } from '../types/index';
import { designSystemsApi, figmaApi } from '../services/api';
import { Plus, ExternalLink, Download, Trash2, Edit } from 'lucide-react';

const DesignSystems: React.FC = () => {
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSystem, setNewSystem] = useState({ name: '', figmaFileId: '' });
  const [extracting, setExtracting] = useState<string | null>(null);

  useEffect(() => {
    fetchDesignSystems();
  }, []);

  const fetchDesignSystems = async () => {
    try {
      const systems = await designSystemsApi.getAll();
      setDesignSystems(systems);
    } catch (error) {
      console.error('Error fetching design systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await designSystemsApi.create(newSystem);
      setNewSystem({ name: '', figmaFileId: '' });
      setShowModal(false);
      fetchDesignSystems();
    } catch (error) {
      console.error('Error creating design system:', error);
    }
  };

  const handleExtractComponents = async (figmaFileId: string) => {
    try {
      setExtracting(figmaFileId);
      await figmaApi.extractComponents(figmaFileId);
      fetchDesignSystems();
    } catch (error) {
      console.error('Error extracting components:', error);
    } finally {
      setExtracting(null);
    }
  };

  const handleDeleteSystem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this design system?')) {
      try {
        await designSystemsApi.delete(id);
        fetchDesignSystems();
      } catch (error) {
        console.error('Error deleting design system:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading design systems...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Systems</h1>
          <p className="text-gray-600">Manage your Figma design systems</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Design System
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designSystems.map((system) => (
          <div key={system.id} className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{system.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExtractComponents(system.figmaFileId)}
                    disabled={extracting === system.figmaFileId}
                    className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                    title="Extract components from Figma"
                  >
                    {extracting === system.figmaFileId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`https://figma.com/file/${system.figmaFileId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Open in Figma"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteSystem(system.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete design system"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Components</div>
                  <div className="font-medium">{system._count.components}</div>
                </div>
                <div>
                  <div className="text-gray-500">Colors</div>
                  <div className="font-medium">{system._count.colors}</div>
                </div>
                <div>
                  <div className="text-gray-500">Typography</div>
                  <div className="font-medium">{system._count.typography}</div>
                </div>
                <div>
                  <div className="text-gray-500">Analyses</div>
                  <div className="font-medium">{system._count.analyses}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(system.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {designSystems.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No design systems yet</div>
              <div className="text-gray-600">Add your first design system to get started</div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Design System
            </h3>
            <form onSubmit={handleCreateSystem}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newSystem.name}
                  onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figma File ID
                </label>
                <input
                  type="text"
                  value={newSystem.figmaFileId}
                  onChange={(e) => setNewSystem({ ...newSystem, figmaFileId: e.target.value })}
                  placeholder="e.g., P3AoC4JoQOlEoKRRKhwGLx"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Find this in your Figma URL: figma.com/file/[FILE_ID]/...
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Add System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignSystems;