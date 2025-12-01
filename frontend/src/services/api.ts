import axios from 'axios';
import type { DesignSystem, Analysis, AnalysisMetrics } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const designSystemsApi = {
  getAll: async (): Promise<DesignSystem[]> => {
    const response = await api.get('/design-systems');
    return response.data;
  },

  getById: async (id: string): Promise<DesignSystem> => {
    const response = await api.get(`/design-systems/${id}`);
    return response.data;
  },

  create: async (data: { name: string; figmaFileId: string }): Promise<DesignSystem> => {
    const response = await api.post('/design-systems', data);
    return response.data;
  },

  update: async (id: string, data: { name: string }): Promise<DesignSystem> => {
    const response = await api.put(`/design-systems/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/design-systems/${id}`);
  },

  getComponents: async (id: string) => {
    const response = await api.get(`/design-systems/${id}/components`);
    return response.data;
  },

  getColors: async (id: string) => {
    const response = await api.get(`/design-systems/${id}/colors`);
    return response.data;
  },

  getTypography: async (id: string) => {
    const response = await api.get(`/design-systems/${id}/typography`);
    return response.data;
  },
};

export const figmaApi = {
  getFile: async (fileId: string) => {
    const response = await api.get(`/figma/file/${fileId}`);
    return response.data;
  },

  extractComponents: async (fileId: string) => {
    const response = await api.post(`/figma/extract-components/${fileId}`);
    return response.data;
  },
};

export const analysisApi = {
  create: async (data: {
    designSystemId: string;
    frameId: string;
    frameName: string;
    analysisData: {
      totalElements: number;
      dsCompliantElements: number;
      componentUsages: Array<{
        componentId: string;
        count: number;
        isCompliant: boolean;
      }>;
      colorUsages: Array<{
        colorId: string;
        count: number;
        isCompliant: boolean;
      }>;
      typographyUsages: Array<{
        typographyId: string;
        count: number;
        isCompliant: boolean;
      }>;
    };
  }): Promise<Analysis> => {
    const response = await api.post('/analysis', data);
    return response.data;
  },

  getById: async (id: string): Promise<Analysis> => {
    const response = await api.get(`/analysis/${id}`);
    return response.data;
  },

  getByDesignSystem: async (
    designSystemId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const response = await api.get(`/analysis/design-system/${designSystemId}`, {
      params,
    });
    return response.data;
  },

  getMetrics: async (
    designSystemId: string,
    params?: { days?: number }
  ): Promise<AnalysisMetrics> => {
    const response = await api.get(`/analysis/metrics/${designSystemId}`, {
      params,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/analysis/${id}`);
  },
};

export default api;