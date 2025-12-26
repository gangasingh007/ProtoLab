import { apiClient } from './client';
import { AIInsight } from '@/types';

export const aiAPI = {
  summarizePaper: async (paperId: string): Promise<{ summary: string }> => {
    const { data } = await apiClient.post(`/ai/papers/${paperId}/summarize`);
    return data;
  },

  quickSummary: async (title: string, content: string): Promise<{ summary: string }> => {
    const { data } = await apiClient.post('/ai/papers/quick-summary', { title, content });
    return data;
  },

  getTeamInsights: async (teamId: string): Promise<AIInsight> => {
    const { data } = await apiClient.get(`/ai/teams/${teamId}/insights`);
    return data;
  },

  suggestNextSteps: async (experimentId: string): Promise<{ suggestions: string[] }> => {
    const { data } = await apiClient.post(`/ai/experiments/${experimentId}/suggest`);
    return data;
  },

  extractKeyInfo: async (experimentId: string): Promise<any> => {
    const { data } = await apiClient.post(`/ai/experiments/${experimentId}/extract`);
    return data;
  },
};
