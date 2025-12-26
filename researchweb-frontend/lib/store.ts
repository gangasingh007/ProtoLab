import { create } from 'zustand';
import { User, Team, Experiment, Paper, PresenceData } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, data: Partial<Team>) => void;
  removeTeam: (id: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  currentTeam: null,
  setTeams: (teams) => set({ teams }),
  setCurrentTeam: (team) => set({ currentTeam: team }),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (id, data) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...data } : t)),
      currentTeam:
        state.currentTeam?.id === id
          ? { ...state.currentTeam, ...data }
          : state.currentTeam,
    })),
  removeTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
      currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
    })),
}));

interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  setExperiments: (experiments: Experiment[]) => void;
  setCurrentExperiment: (experiment: Experiment | null) => void;
  addExperiment: (experiment: Experiment) => void;
  updateExperiment: (id: string, data: Partial<Experiment>) => void;
  removeExperiment: (id: string) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  experiments: [],
  currentExperiment: null,
  setExperiments: (experiments) => set({ experiments }),
  setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),
  addExperiment: (experiment) =>
    set((state) => ({ experiments: [experiment, ...state.experiments] })),
  updateExperiment: (id, data) =>
    set((state) => ({
      experiments: state.experiments.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
      currentExperiment:
        state.currentExperiment?.id === id
          ? { ...state.currentExperiment, ...data }
          : state.currentExperiment,
    })),
  removeExperiment: (id) =>
    set((state) => ({
      experiments: state.experiments.filter((e) => e.id !== id),
      currentExperiment:
        state.currentExperiment?.id === id ? null : state.currentExperiment,
    })),
}));

interface PaperState {
  papers: Paper[];
  setPapers: (papers: Paper[]) => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (id: string, data: Partial<Paper>) => void;
  removePaper: (id: string) => void;
}

export const usePaperStore = create<PaperState>((set) => ({
  papers: [],
  setPapers: (papers) => set({ papers }),
  addPaper: (paper) => set((state) => ({ papers: [paper, ...state.papers] })),
  updatePaper: (id, data) =>
    set((state) => ({
      papers: state.papers.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  removePaper: (id) =>
    set((state) => ({ papers: state.papers.filter((p) => p.id !== id) })),
}));

interface PresenceState {
  presence: Map<string, PresenceData>;
  setPresence: (experimentId: string, users: PresenceData[]) => void;
  updateUserPresence: (userId: string, data: PresenceData) => void;
  removeUserPresence: (userId: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  presence: new Map(),
  setPresence: (experimentId, users) =>
    set({ presence: new Map(users.map((u) => [u.userId, u])) }),
  updateUserPresence: (userId, data) =>
    set((state) => {
      const newPresence = new Map(state.presence);
      newPresence.set(userId, data);
      return { presence: newPresence };
    }),
  removeUserPresence: (userId) =>
    set((state) => {
      const newPresence = new Map(state.presence);
      newPresence.delete(userId);
      return { presence: newPresence };
    }),
}));
