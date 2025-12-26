import { create } from 'zustand';
import { Experiment } from '@/types';

interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  setExperiments: (experiments: Experiment[]) => void;
  setCurrentExperiment: (experiment: Experiment | null) => void;
  addExperiment: (experiment: Experiment) => void;
  updateExperiment: (id: string, updates: Partial<Experiment>) => void;
  removeExperiment: (id: string) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  experiments: [],
  currentExperiment: null,

  setExperiments: (experiments) => set({ experiments }),

  setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),

  addExperiment: (experiment) =>
    set((state) => ({ experiments: [...state.experiments, experiment] })),

  updateExperiment: (id, updates) =>
    set((state) => ({
      experiments: state.experiments.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
      currentExperiment:
        state.currentExperiment?.id === id
          ? { ...state.currentExperiment, ...updates }
          : state.currentExperiment,
    })),

  removeExperiment: (id) =>
    set((state) => ({
      experiments: state.experiments.filter((e) => e.id !== id),
      currentExperiment:
        state.currentExperiment?.id === id ? null : state.currentExperiment,
    })),
}));
