import { apiClient } from './client';
import { KnowledgeGraph } from '@/types';

export const graphAPI = {
  getTeamGraph: async (teamId: string): Promise<KnowledgeGraph> => {
    const { data } = await apiClient.get(`/graph/teams/${teamId}`);
    return data;
  },

  getRelatedExperiments: async (experimentId: string): Promise<any> => {
    const { data } = await apiClient.get(`/graph/experiments/${experimentId}/relations`);
    return data;
  },
};
