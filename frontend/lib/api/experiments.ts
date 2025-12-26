import { apiClient } from './client';
import { Experiment } from '@/types';

export const experimentsAPI = {
  getTeamExperiments: async (teamId: string): Promise<Experiment[]> => {
    const { data } = await apiClient.get(`/experiments/team/${teamId}`);
    return data;
  },

  getExperiment: async (id: string): Promise<Experiment> => {
    const { data } = await apiClient.get(`/experiments/${id}`);
    return data;
  },

  createExperiment: async (experimentData: {
    title: string;
    hypothesis?: string;
    method?: string;
    teamId: string;
    tags?: string[];
  }): Promise<Experiment> => {
    const { data } = await apiClient.post('/experiments/new', experimentData);
    return data;
  },

  updateExperiment: async (id: string, experimentData: Partial<Experiment>): Promise<Experiment> => {
    const { data } = await apiClient.put(`/experiments/${id}`, experimentData);
    return data;
  },

  deleteExperiment: async (id: string): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`);
  },
};
