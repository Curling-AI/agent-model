import { Conversation } from '@/types/conversation'
import { create } from 'zustand'
import { BASE_URL } from '@/utils/constants'

interface ConversationState {
  conversations: Conversation[]
  currentConversationId: number | null
  listConversations: (organizationId: number) => Promise<Conversation[]>
  createConversation: (name: string) => Promise<Conversation | null>
  deleteConversation: (id: number) => Promise<void>
  sendMessage: (agentId: number, userId: number, message: string) => Promise<string | undefined>
  setCurrentConversation: (id: number) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  currentConversationId: null,

  listConversations: async (organizationId: number) => {
    const url = new URL(`${BASE_URL}/conversations`)
    url.searchParams.set('organizationId', organizationId.toString())
    const res = await fetch(url.toString())
    const data = await res.json()
    if (!res.ok) return []
    set({ conversations: data })
    return data
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

  sendMessage: async (agentId, userId, message) => {
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
}))
