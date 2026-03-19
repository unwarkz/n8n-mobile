import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface N8nInstance {
  id: string;
  name: string;
  url: string;
  apiKey: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'warn';
  message: string;
  details?: string;
}

interface AppState {
  instances: N8nInstance[];
  activeInstanceId: string | null;
  logs: LogEntry[];
  addInstance: (instance: Omit<N8nInstance, 'id'>) => void;
  removeInstance: (id: string) => void;
  setActiveInstance: (id: string | null) => void;
  getActiveInstance: () => N8nInstance | undefined;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      instances: [],
      activeInstanceId: null,
      logs: [],
      addInstance: (instance) => set((state) => ({
        instances: [...state.instances, { ...instance, id: crypto.randomUUID() }]
      })),
      removeInstance: (id) => set((state) => ({
        instances: state.instances.filter((i) => i.id !== id),
        activeInstanceId: state.activeInstanceId === id ? null : state.activeInstanceId
      })),
      setActiveInstance: (id) => set({ activeInstanceId: id }),
      getActiveInstance: () => {
        const state = get();
        return state.instances.find((i) => i.id === state.activeInstanceId);
      },
      addLog: (log) => set((state) => ({
        logs: [{ ...log, id: crypto.randomUUID(), timestamp: Date.now() }, ...state.logs].slice(0, 200)
      })),
      clearLogs: () => set({ logs: [] })
    }),
    { name: 'n8n-mobile-store' }
  )
);
