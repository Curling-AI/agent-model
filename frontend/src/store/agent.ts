import { create } from 'zustand';
import { Agent } from '@/types/agent';
import { BASE_URL } from '@/utils/constants';

interface AgentState {
  agent: Agent;
  agents: Agent[];
  setAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;
  newAgent: () => void;
  fetchAgent: (id: string) => Promise<Agent>;
  fetchAgents: (organizationId: number, filter: string) => Promise<Agent[]>;
  createOrUpdateAgent: (agent: Agent) => Promise<Agent>;
  deleteAgent: (id: number) => Promise<void>;
  updateAgentAttribute: <K extends keyof Agent>(key: K, value: Agent[K]) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agent: emptyAgent(),
  agents: [],
  newAgent: () => set({ agent: emptyAgent() }),
  setAgents: (agents) => set({ agents }),
  setAgent: (agent) => {
    set({ agent });
  },
  fetchAgent: async (id: string) => {
    const response = await fetch(`${BASE_URL}/api/agents/${id}`);
    const data = await response.json();
    if (data) {
      const agent = fillAgent(data);
      set({ agent });
      return new Promise(resolve => resolve(agent));
    }
    return emptyAgent();
  },
  fetchAgents: async (organizationId: number, filter: string = 'all') => {
    const response = await fetch(`${BASE_URL}/api/agents?organizationId=${organizationId}&filter=${filter}`);
    const data = await response.json();
    if (data) {
      const agents = data.map((item: any) => fillAgent(item));
      set({ agents });
      return agents;
    }
    return [];
  },
  createOrUpdateAgent: async (agent: Agent) => {
    const url = `${BASE_URL}/api/agents`;

    const body = JSON.stringify({
      id: agent.id === 0 ? undefined : agent.id,
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    const data = await response.json();
    if (data) {
      const agent = fillAgent(data);
      set({ agent });
      return new Promise(resolve => resolve(agent));
    }
    return emptyAgent();
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

function emptyAgent(): Agent {
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
    scheduleAgentBegin: '09:00',
    scheduleAgentEnd: '18:00',
    prompt: '',
    promptType: 'simple',
    documents: [],
    followUps: [],
    serviceProviders: [],
  }
}

function fillAgent(data: any): Agent {
  return {
    id: data.id || 0,
    organizationId: data.organization_id || 0,
    name: data.name || '',
    active: data.active || false,
    description: data.description || '',
    greetings: data.greetings || '',
    tone: data.tone || '',
    voiceConfiguration: data.voice_configuration || '',
    responseTime: data.response_time || 0,
    scheduleAgentBegin: data.schedule_agent_begin || '',
    scheduleAgentEnd: data.schedule_agent_end || '',
    prompt: data.prompt || '',
    promptType: data.prompt_type || 'simple',
    documents: data.documents || [],
    followUps: data.follow_ups || [],
    serviceProviders: data.service_providers || [],
  }
}