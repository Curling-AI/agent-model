import { create } from 'zustand';
import { Agent } from '@/types/agent';
import { BASE_URL } from '@/utils/constants';

interface AgentState {
  agent: Agent;
  agents: Agent[];
  setAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;
  clearAgent: () => void;
  newAgent: (agent: Agent) => Promise<Agent>;
  fetchAgent: (id: string) => Promise<Agent>;
  fetchAgents: (organizationId: number, filter: string) => Promise<Agent[]>;
  createOrUpdateAgent: (agent: Agent) => Promise<Agent>;
  deleteAgent: (id: number) => Promise<void>;
  updateAgentAttribute: <K extends keyof Agent>(key: K, value: Agent[K]) => void;
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
    const response = await fetch(`${BASE_URL}/api/agents/${id}`);
    const data = await response.json();
    if (data) {
      set({ agent: data });
      return data;
    }
    return null;
  },
  fetchAgents: async (organizationId: number, filter: string = 'all') => {
    const response = await fetch(`${BASE_URL}/api/agents?organizationId=${organizationId}&filter=${filter}`);
    const data = await response.json();
    if (data) {
      set({ agents: data });
      return data;
    }
    return [];
  },
  createOrUpdateAgent: async (agent: Agent) => {
    const method = agent.id || agent.id != 0 ? 'PUT' : 'POST';
    const url = agent.id ? `${BASE_URL}/api/agents/${agent.id}` : `${BASE_URL}/api/agents`;

    const body = JSON.stringify({
      organization_id: agent.organizationId,
      name: agent.name,
      active: agent.active,
      description: agent.description,
      greetings: agent.greetings,
      tone: agent.tone,
      voice_configuration: agent.voiceConfiguration,
      response_time: agent.responseTime,
      schedule_agent_begin: agent.scheduleAgentBegin,
      schedule_agent_end: agent.scheduleAgentEnd,
      prompt_type: agent.promptType,
      prompt: agent.prompt
    });

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    const data = await response.json();
    console.log(data);
    if (data) {
      agent.id = data.id;
      set({ agent });
      return data;
    }
    return null;
  },
  deleteAgent: async (id: number) => {
    const response = await fetch(`${BASE_URL}/api/agents/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      set({ agents: get().agents.filter(agent => agent.id !== id) });
    }
  },
  updateAgentAttribute: <K extends keyof Agent>(key: K, value: Agent[K]) => {
    set((state) => ({
      agent: {
        ...state.agent,
        [key]: value
      }
    }));
  }
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
    prompt: '',
    promptType: 'simple',
    documents: [],
    followUps: [],
    serviceProviders: [],
  }
}