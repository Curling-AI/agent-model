import { Organization, ServiceProvider } from ".";
import { FollowUp } from "./follow_up";

export interface Agent {
  id: number;
  organization: Organization;
  name: string;
  active: boolean;
  description: string;
  greetings: string;
  tone: string;
  voiceConfiguration: string;
  responseTime: 0 | 1 | 5 | 15;
  scheduleAgentBegin: string;
  scheduleAgentEnd: string;
  prompt: AgentPrompt;
  documents: AgentDocument[];
  followUps: FollowUp[];
  serviceProviders: ServiceProvider[];
}

export interface AgentPrompt {
  type: 'simple' | 'advanced';
  prompt: string;
}

export interface AgentDocument {
  id: number;
  type: 'file' | 'faq' | 'video';
  name: string;
  content: string;
}
