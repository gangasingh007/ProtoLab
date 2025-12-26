import { apiClient } from './client';
import { Team } from '@/types';

export const teamsAPI = {
  getMyTeams: async (): Promise<Team[]> => {
    const { data } = await apiClient.get('/teams/my-teams');
    return data;
  },

  getTeam: async (id: string): Promise<Team> => {
    const { data } = await apiClient.get(`/teams/${id}`);
    return data;
  },

  createTeam: async (teamData: { name: string; description?: string }): Promise<Team> => {
    const { data } = await apiClient.post('/teams', teamData);
    return data;
  },

  updateTeam: async (id: string, teamData: { name?: string; description?: string }): Promise<Team> => {
    const { data } = await apiClient.put(`/teams/${id}`, teamData);
    return data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },

  addMember: async (teamId: string, userId: string, role?: string): Promise<void> => {
    await apiClient.post(`/teams/${teamId}/members`, { userId, role });
  },

  updateMemberRole: async (teamId: string, userId: string, role: string): Promise<void> => {
    await apiClient.put(`/teams/${teamId}/members/${userId}`, { role });
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  getStats: async (teamId: string): Promise<any> => {
    const { data } = await apiClient.get(`/teams/${teamId}/stats`);
    return data;
  },
};
