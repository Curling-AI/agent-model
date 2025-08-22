import { Agent } from "./agent";
import { Lead } from "./lead";

export interface Conversation {
  id: number;
  agent: Agent;
  lead: Lead;
  tags: ConversationTag[];
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  id: number;
  conversation: Conversation;
  sender: 'human' | 'agent';
  content: string;
  timestamp: Date;
}

export interface ConversationTag {
  id: number;
  name: string;
}