import { Conversation } from '@/types/conversation'
import { create } from 'zustand'
import { BASE_URL } from '@/utils/constants'
import { supabase } from '@/config/supabaseClient'
import { RealtimeChannel } from '@supabase/supabase-js'

interface ConversationState {
  conversations: Conversation[]
  currentConversationId: number | null
  channel: RealtimeChannel | null
  isLoading: boolean
  listConversations: (organizationId: number) => Promise<Conversation[]>
  createConversation: (name: string) => Promise<Conversation | null>
  deleteConversation: (id: number) => Promise<void>
  sendTestMessage: (agentId: number, userId: number, message: string) => Promise<string | undefined>
  setCurrentConversation: (id: number) => void
  subscribeToUpdates: (conversations: Conversation[], listener?: (payload: any) => void) => RealtimeChannel
  unsubscribeFromUpdates: (channel: RealtimeChannel) => void
  sendMessage: (agentId: number, userId: number, message: string, to: string, conversationId: number) => Promise<string | undefined>
  changeConversationMode: (conversationId: number, mode: 'agent' | 'human') => Promise<void>
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  currentConversationId: null,
  channel: null,
  isLoading: false,
  listConversations: async (organizationId: number) => {
    set({ isLoading: true })
    try {
      const url = new URL(`${BASE_URL}/conversations`)
      url.searchParams.set('organizationId', organizationId.toString())
      const res = await fetch(url.toString())
      const data = await res.json()
      if (!res.ok) return []
      set({ conversations: data, isLoading: false })
      return data
    } catch (error) {
      set({ isLoading: false })
      return []
    }
  },

  createConversation: async (name: string) => {
    const res = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return null
    const newConversation = await res.json()
    set((state) => ({
      conversations: [...state.conversations, newConversation],
      currentConversationId: newConversation.id,
    }))
    return newConversation
  },

  deleteConversation: async (id: number) => {
    await fetch(`${BASE_URL}/conversations/${id}`, { method: 'DELETE' })
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id ? null : state.currentConversationId,
    }))
  },

  sendTestMessage: async (agentId, userId, message) => {
    const res = await fetch(`${BASE_URL}/conversations/process-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, userId, userInput: message }),
    })
    if (!res.ok) return
    const msg = await res.json()
    return msg
  },

  setCurrentConversation: (id: number) => {
    set(() => ({ currentConversationId: id }))
  },

  subscribeToUpdates: (conversations: Conversation[], listener: (payload: any) => void = () => {}) => {
    const channel = supabase.channel('conversations')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `conversation_id=in.(${Array.from(new Set(conversations.map((c) => c.id))).join(',')})` }, (payload: any) => {
      set((state) => ({
        conversations: state.conversations.map((c) => {
          if (c.id === payload.new.conversation_id) {
            // Verificar se a mensagem já existe para evitar duplicatas
            const messageExists = c.messages.some(m => m.id === payload.new.id)
            if (!messageExists) {
              return {
                ...c, 
                messages: [...c.messages, {
                  ...payload.new,
                  timestamp: new Date(payload.new.timestamp)
                }]
              }
            }
          }
          return c
        }),
      }));
      listener(payload);
    }).subscribe();
    set({ channel: channel });
    return channel;
  },

  unsubscribeFromUpdates: (channel: RealtimeChannel) => {
    if (channel) {
      channel.unsubscribe();
      set({ channel: null });
    }
  },

  sendMessage: async (agentId: number, userId: number, message: string, to: string, conversationId: number) => {
    const instance = `agent-${agentId}-user-${userId}`
    const res = await fetch(`${BASE_URL}/messages/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, to, instanceName: instance, conversationId: conversationId }),
    })
    if (!res.ok) return
    const msg = await res.json()
    return msg
  },

  changeConversationMode: async (conversationId: number, mode: 'agent' | 'human') => {
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/mode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    if (!res.ok) throw new Error('Failed to change conversation mode')
    const data = await res.json()
    set((state) => ({
      conversations: state.conversations.map((c) => c.id === conversationId ? { ...c, mode } : c),
    }))
    return data
  },
}))
