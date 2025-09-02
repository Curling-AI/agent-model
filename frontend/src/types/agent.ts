import { BaseInterface, ServiceProvider } from '.';
import { FollowUp } from "./follow_up";

export interface BaseAgent {
  agentId: number;
}

export interface Agent extends BaseInterface {
  id: number;
  name: string;
  active: boolean;
  description: string;
  greetings: string;
  tone: string;
  voiceConfiguration: string;
  responseTime: 0 | 1 | 5 | 15;
  scheduleAgentBegin: string;
  scheduleAgentEnd: string;
  promptType: 'simple' | 'advanced';
  prompt?: string;
  documents: Document[];
  followUps: FollowUp[];
  serviceProviders: ServiceProvider[];
}

export interface Document extends BaseAgent {
  id: number;
  type: 'file' | 'faq' | 'video' | 'website';
  name: string;
  content?: string;
  chunks?: Chunk[];
}

export interface Chunk {
  id: number;
  documentId: number;
  text: string
  similarity: number
  tokens: number
  pageNumber?: number
}
