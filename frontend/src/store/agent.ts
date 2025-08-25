import { create } from 'zustand';
import { Agent } from '../../global-types/agent';

interface AgentState {
  agent: Agent | null;
  setAgent: (agent: Agent) => void;
  clearAgent: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agent: null,
  setAgent: (agent) => set({ agent }),
  clearAgent: () => set({ agent: null }),
}));