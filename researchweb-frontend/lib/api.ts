import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),
};

// Teams
export const teamsAPI = {
  getMyTeams: () => api.get('/teams/my-teams'),
  getTeam: (id: string) => api.get(`/teams/${id}`),
  createTeam: (data: { name: string; description?: string }) =>
    api.post('/teams', data),
  updateTeam: (id: string, data: { name: string; description?: string }) =>
    api.put(`/teams/${id}`, data),
  deleteTeam: (id: string) => api.delete(`/teams/${id}`),
  addMember: (teamId: string, userId: string, role: string) =>
    api.post(`/teams/${teamId}/members`, { userId, role }),
  updateMemberRole: (teamId: string, userId: string, role: string) =>
    api.put(`/teams/${teamId}/members/${userId}`, { role }),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
  getStats: (teamId: string) => api.get(`/teams/${teamId}/stats`),
};

// Experiments
export const experimentsAPI = {
  getTeamExperiments: (teamId: string) =>
    api.get(`/experiments/team/${teamId}`),
  getExperiment: (id: string) => api.get(`/experiments/${id}`),
  createExperiment: (data: any) => api.post('/experiments/new', data),
  updateExperiment: (id: string, data: any) =>
    api.put(`/experiments/${id}`, data),
  deleteExperiment: (id: string) => api.delete(`/experiments/${id}`),
};

// Papers
export const papersAPI = {
  getTeamPapers: (teamId: string) => api.get(`/papers/team/${teamId}`),
  getPaper: (id: string) => api.get(`/papers/${id}`),
  createPaper: (data: any) => api.post('/papers', data),
  updatePaper: (id: string, data: any) => api.put(`/papers/${id}`, data),
  deletePaper: (id: string) => api.delete(`/papers/${id}`),
  linkToExperiment: (paperId: string, experimentId: string) =>
    api.post(`/papers/${paperId}/link-experiment`, { experimentId }),
  unlinkFromExperiment: (paperId: string, experimentId: string) =>
    api.delete(`/papers/${paperId}/unlink-experiment/${experimentId}`),
  searchPapers: (teamId: string, query: string) =>
    api.get(`/papers/team/${teamId}/search?query=${query}`),
};

// Comments
export const commentsAPI = {
  getExperimentComments: (experimentId: string) =>
    api.get(`/comments/experiment/${experimentId}`),
  createComment: (data: {
    content: string;
    experimentId: string;
    mentions?: string[];
  }) => api.post('/comments', data),
  updateComment: (id: string, data: { content: string; mentions?: string[] }) =>
    api.put(`/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  getMentions: () => api.get('/comments/mentions/me'),
};


export const aiAPI = {
  summarizePaper: (paperId: string) =>
    api.post(`/ai/papers/${paperId}/summarize`),
  getTeamInsights: (teamId: string) =>
    api.get(`/ai/teams/${teamId}/insights`),
  suggestNextSteps: (experimentId: string) =>
    api.post(`/ai/experiments/${experimentId}/suggest`),
  extractKeyInfo: (experimentId: string) =>
    api.post(`/ai/experiments/${experimentId}/extract`),
  quickSummary: (data: { title: string; content: string }) =>
    api.post('/ai/papers/quick-summary', data),
};
export default api;
