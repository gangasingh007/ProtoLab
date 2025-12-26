import { create } from 'zustand';
import { Team } from '@/types';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  currentTeam: null,

  setTeams: (teams) => set({ teams }),

  setCurrentTeam: (team) => set({ currentTeam: team }),

  addTeam: (team) =>
    set((state) => ({ teams: [...state.teams, team] })),

  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      currentTeam:
        state.currentTeam?.id === id
          ? { ...state.currentTeam, ...updates }
          : state.currentTeam,
    })),

  removeTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
      currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
    })),
}));
