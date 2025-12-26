import { apiClient } from './client';
import { Paper } from '@/types';

export const papersAPI = {
  getTeamPapers: async (teamId: string): Promise<Paper[]> => {
    const { data } = await apiClient.get(`/papers/team/${teamId}`);
    return data;
  },

  getPaper: async (id: string): Promise<Paper> => {
    const { data } = await apiClient.get(`/papers/${id}`);
    return data;
  },

  createPaper: async (paperData: {
    title: string;
    authors?: string;
    url?: string;
    pdfUrl?: string;
    summary?: string;
    findings?: string;
    methodology?: string;
    limitations?: string;
    teamId: string;
  }): Promise<Paper> => {
    const { data } = await apiClient.post('/papers', paperData);
    return data;
  },

  updatePaper: async (id: string, paperData: Partial<Paper>): Promise<Paper> => {
    const { data } = await apiClient.put(`/papers/${id}`, paperData);
    return data;
  },

  deletePaper: async (id: string): Promise<void> => {
    await apiClient.delete(`/papers/${id}`);
  },

  linkToExperiment: async (paperId: string, experimentId: string): Promise<void> => {
    await apiClient.post(`/papers/${paperId}/link-experiment`, { experimentId });
  },

  unlinkFromExperiment: async (paperId: string, experimentId: string): Promise<void> => {
    await apiClient.delete(`/papers/${paperId}/unlink-experiment/${experimentId}`);
  },

  searchPapers: async (teamId: string, query: string): Promise<Paper[]> => {
    const { data } = await apiClient.get(`/papers/team/${teamId}/search`, {
      params: { query },
    });
    return data;
  },
};
