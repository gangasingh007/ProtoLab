import { apiClient } from './client';
import { Comment } from '@/types';

export const commentsAPI = {
  getExperimentComments: async (experimentId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get(`/comments/experiment/${experimentId}`);
    return data;
  },

  createComment: async (commentData: {
    content: string;
    experimentId: string;
    mentions?: string[];
  }): Promise<Comment> => {
    const { data } = await apiClient.post('/comments', commentData);
    return data;
  },

  updateComment: async (id: string, content: string): Promise<Comment> => {
    const { data } = await apiClient.put(`/comments/${id}`, { content });
    return data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },

  getMyMentions: async (): Promise<Comment[]> => {
    const { data } = await apiClient.get('/comments/mentions/me');
    return data;
  },

  reactToComment: async (id: string, reaction: string): Promise<void> => {
    await apiClient.post(`/comments/${id}/react`, { reaction });
  },
};
