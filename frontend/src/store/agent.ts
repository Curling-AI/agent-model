import { create } from 'zustand';
import { Agent } from '../../../global-types/agent.ts';

interface AgentState {
  agent: Agent | null;
  agents: Agent[];
  setAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;
  clearAgent: () => void;
  newAgent: (agent: Agent) => Promise<Agent>;
  fetchAgent: (id: string) => Promise<Agent>;
  fetchAgents: (organizationId: number) => Promise<Agent[]>;
  createAgent: (agent: Agent) => Promise<Agent>;
  updateAgent: (agent: Agent) => Promise<Agent>;
  deleteAgent: (id: number) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agent: fillAgent(),
  agents: [],
  setAgents: (agents) => set({ agents }),
  setAgent: (agent) => set({ agent }),
  clearAgent: () => set({ agent: fillAgent() }),
  newAgent: async (agent: Agent) => {
    set({ agent });
    return agent;
  },
  fetchAgent: async (id: string) => {
    const response = await fetch(`/api/agents/${id}`);
    const data = await response.json();
    if (data) {
      set({ agent: data });
      return data;
    }
    return null;
  },
  fetchAgents: async (organizationId: number) => {
    const response = await fetch(`/api/agents?organizationId=${organizationId}`);
    const data = await response.json();
    if (data) {
      set({ agents: data });
      return data;
    }
    return [];
  },
  createAgent: async (agent: Agent) => {
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agent),
    });
    const data = await response.json();
    if (data) {
      set({ agent: data });
      return data;
    }
    return null;
  },
  updateAgent: async (agent: Agent) => {
    const response = await fetch(`/api/agents/${agent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agent),
    });
    const data = await response.json();
    if (data) {
      set({ agent: data });
      return data;
    }
    return null;
  },
  deleteAgent: async (id: number) => {
    const response = await fetch(`/api/agents/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      set({ agents: get().agents.filter(agent => agent.id !== id) });
    }
  },
}));

function fillAgent(): Agent {
  return {
    id: 0,
    organizationId: 0,
    name: '',
    active: false,
    description: '',
    greetings: '',
    tone: '',
    voiceConfiguration: '',
    responseTime: 0,
    scheduleAgentBegin: '',
    scheduleAgentEnd: '',
    prompt: {
      id: 0,
      agentId: 0,
      type: 'simple',
      prompt: '',
    },
    documents: [],
    followUps: [],
    serviceProviders: [],
  }
}