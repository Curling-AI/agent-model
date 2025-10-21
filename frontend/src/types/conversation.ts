import { BaseInterface } from '.'
import { Agent } from './agent'
import { Lead } from './lead'

export interface Conversation extends BaseInterface {
  id: number
  agent: Agent
  lead: Lead
  tags: ConversationTag[]
  messages: ConversationMessage[]
  mode: 'agent' | 'human'
}

export interface ConversationMessage {
  id: number
  conversationId: number
  sender: 'human' | 'agent' | 'member'
  content: string
  timestamp: Date
  metadata: any
}

export interface ConversationTag {
  id: number
  name: string
}
