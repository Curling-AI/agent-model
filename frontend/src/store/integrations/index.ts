import { FacebookAccessToken } from '@/types/facebook'
import { INTEGRATION_ID_MAP, INTEGRATION_NAME_MAP, IntegrationStatus } from '@/utils/constants'
import { IntegrationType } from '@/utils/constants'
import { create } from 'zustand'

export interface WhatsappQrcode {
  pairingCode: string | null
  code: string
  base64: string
  count: number
}
export interface WhatsappConfig {
  hash: string
  instanceId: string
  instanceName: string
  integration: string
  webhookWaBusiness: string | null
  accessTokenWaBusiness: string
  qrcode?: WhatsappQrcode
}

export interface WhatsappOficialConfig {
  hash: string
  instanceId: string
  instanceName: string
  integration: string
  webhookWaBusiness: string | null
  accessTokenWaBusiness: FacebookAccessToken
}

export interface GoogleCalendarConfig {
  accessToken: string
  refreshToken: string
  expiryDate?: number
  calendarId: string
  calendarName?: string
  timeZone?: string
}

export interface WhatsappMetadata {
  hash?: string
  instanceId?: string
  instanceName?: string
  integration?: string
  webhookWaBusiness?: string | null
  accessTokenWaBusiness?: string
  qrcode?: WhatsappQrcode
  status?: IntegrationStatus
  state?: string
  connectedAt?: string
}

export interface Integration {
  type: IntegrationType
  status: IntegrationStatus
  config?: GoogleCalendarConfig | WhatsappConfig | WhatsappOficialConfig
  error?: string
  connectedAt?: string
  integrationAgentId?: number
  organizationIntegrationId?: number
}

interface IntegrationAgent {
  id: number
  metadata?: {
    hash?: string
    instanceId?: string
    instanceName?: string
    integration?: string
    webhookWaBusiness?: string | null
    accessTokenWaBusiness?: string
    qrcode?: WhatsappQrcode
    status?: IntegrationStatus
    config?: GoogleCalendarConfig
    error?: string
    connectedAt?: string
  }
  organization_integrations?: {
    id: number
    integration_id: number
  }
  organization_integration_id?: number
}

type IntegrationsStore = {
  integrations: Integration[]
  isLoading: boolean
  error: Error | null
  fetchIntegrations: (agentId: number) => Promise<void>
  startWhatsappConnection: (
    agentId: number,
  ) => Promise<{ success: boolean; error?: string; data?: Integration }>
  getWhatsappQrcode: (
    integrationAgentId: number,
  ) => Promise<{ success: boolean; error?: string; data?: WhatsappQrcode }>
  connectGoogleCalendar: (agentId: number) => Promise<{ success: boolean; error?: string }>
  disconnectGoogleCalendar: (agentId: number) => Promise<{ success: boolean; error?: string }>
  checkWhatsappStatus: () => Promise<{ success: boolean; error?: string }>
  updateWhatsappStatusInDatabase: (
    integrationAgentId: number,
    status: IntegrationStatus,
    metadata?: WhatsappMetadata,
  ) => Promise<{ success: boolean; error?: string }>
  setIntegrationStatus: (type: IntegrationType, status: IntegrationStatus, error?: string) => void
  disconnectWhatsapp: (agentId: number) => Promise<{ success: boolean; error?: string }>
  getFacebookAccessToken: (
    code: string,
  ) => Promise<{ success: boolean; error?: string; data?: FacebookAccessToken }>
  saveFacebookConnection: (
    agentId: number,
    accessToken: FacebookAccessToken,
  ) => Promise<{ success: boolean; error?: string; data?: Integration }>
  subscribeFacebookApp: (
    accessToken: FacebookAccessToken,
  ) => Promise<{ success: boolean; error?: string }>
  registerWhatsappNumberOficial: (
    phoneNumberId: string,
    accessToken: string,
  ) => Promise<{ success: boolean; error?: string }>
  disconnectWhatsappOficial: (agentId: number) => Promise<{ success: boolean; error?: string }>
}

export const useIntegrationsStore = create<IntegrationsStore>((set, get) => ({
  integrations: [],
  isLoading: false,
  error: null,

  fetchIntegrations: async (agentId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/integrations/integration-agents?agentId=${agentId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Erro ao buscar integrações do agente')
      }

      const data = await response.json()
      const integrationAgents: IntegrationAgent[] = data.data || []

      const integrations: Integration[] = integrationAgents.map((ia: IntegrationAgent) => {
        const iaID = ia.organization_integrations?.integration_id

        if (iaID === INTEGRATION_ID_MAP.google_calendar) {
          return {
            type: 'google_calendar',
            status: ia.metadata?.status || 'disconnected',
            config: ia.metadata?.config,
            error: ia.metadata?.error,
            connectedAt: ia.metadata?.connectedAt,
            integrationAgentId: ia.id,
            organizationIntegrationId: ia.organization_integrations?.id,
          } as Integration
        }

        if (iaID === INTEGRATION_ID_MAP.whatsapp) {
          return {
            type: 'whatsapp',
            integrationAgentId: ia.id,
            organizationIntegrationId: ia.organization_integrations?.id,
            status: ia.metadata?.status === 'connected' ? 'connected' : 'connecting',
            connectedAt: ia.metadata?.connectedAt,
            config: {
              hash: ia.metadata?.hash,
              instanceId: ia.metadata?.instanceId,
              instanceName: ia.metadata?.instanceName,
              integration: ia.metadata?.integration,
              webhookWaBusiness: ia.metadata?.webhookWaBusiness,
              accessTokenWaBusiness: ia.metadata?.accessTokenWaBusiness,
            },
          } as Integration
        }

        if (iaID === INTEGRATION_ID_MAP.whatsapp_oficial) {
          return {
            type: 'whatsapp_oficial',
            integrationAgentId: ia.id,
            organizationIntegrationId: ia.organization_integrations?.id,
            status: ia.metadata?.status === 'connected' ? 'connected' : 'connecting',
            connectedAt: ia.metadata?.connectedAt,
            config: {
              hash: ia.metadata?.hash,
              instanceId: ia.metadata?.instanceId,
              instanceName: ia.metadata?.instanceName,
              integration: ia.metadata?.integration,
              webhookWaBusiness: ia.metadata?.webhookWaBusiness,
              accessTokenWaBusiness: ia.metadata?.accessTokenWaBusiness,
            },
          } as Integration
        }

        return {
          type: INTEGRATION_NAME_MAP[iaID!],
          status: 'disconnected',
        }
      })

      if (integrations.every((integration) => integration.type !== 'whatsapp')) {
        integrations.push({
          type: 'whatsapp',
          status: 'disconnected',
        })
      }

      if (integrations.every((integration) => integration.type !== 'google_calendar')) {
        integrations.push({
          type: 'google_calendar',
          status: 'disconnected',
        })
      }

      if (integrations.every((integration) => integration.type !== 'whatsapp_oficial')) {
        integrations.push({
          type: 'whatsapp_oficial',
          status: 'disconnected',
        })
      }

      set({ integrations, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  startWhatsappConnection: async (agentId: number) => {
    set({ error: null, isLoading: true })
    try {
      get().setIntegrationStatus('whatsapp', 'connecting')

      const response = await fetch('/api/integrations/whatsapp/evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ agentId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao conectar WhatsApp')
      }

      const {
        data: {
          id: integrationAgentId,
          organizationIntegrationId,
          metadata: { status, ...config },
        },
      } = await response.json()

      const wpIntegration = {
        type: 'whatsapp',
        integrationAgentId,
        organizationIntegrationId,
        status: status === 'connected' ? 'connected' : 'connecting',
        config: config as WhatsappConfig,
      } as Integration

      set({
        integrations: [
          ...get().integrations.filter((integration) => integration.type !== 'whatsapp'),
          wpIntegration,
        ],
        isLoading: false,
      })

      return { success: true, data: wpIntegration }
    } catch (error) {
      get().setIntegrationStatus('whatsapp', 'error', (error as Error).message)
      set({ error: error as Error, isLoading: false })
      return { success: false, error: (error as Error).message }
    }
  },

  getWhatsappQrcode: async (integrationAgentId: number) => {
    set({ error: null, isLoading: true })
    try {
      const response = await fetch(`/api/integrations/whatsapp/evolution/${integrationAgentId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Erro ao buscar QR Code do WhatsApp')
      }

      const data = await response.json()

      const {
        data: { metadata },
      } = data

      set({
        integrations: get().integrations.map((integration) =>
          integration.type === 'whatsapp'
            ? ({
                ...integration,
                status: metadata.status === 'connected' ? 'connected' : 'connecting',
                config: {
                  ...integration.config,
                  qrcode: metadata.qrcode,
                },
              } as Integration)
            : integration,
        ),
        isLoading: false,
      })

      return { success: true, data: metadata.qrcode }
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      return { success: false, error: (error as Error).message }
    }
  },

  connectGoogleCalendar: async (agentId: number) => {
    set({ error: null })
    try {
      get().setIntegrationStatus('google_calendar', 'connecting')

      const response = await fetch('/api/integrations/google-calendar/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ agentId }),
      })

      if (!response.ok) {
        throw new Error('Erro ao conectar Google Calendar')
      }

      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      }

      return { success: true }
    } catch (error) {
      get().setIntegrationStatus('google_calendar', 'error', (error as Error).message)
      set({ error: error as Error, isLoading: false })
      return { success: false, error: (error as Error).message }
    }
  },

  disconnectGoogleCalendar: async (agentId: number) => {
    set({ isLoading: true, error: null })
    try {
      const googleCalendarIntegration = get().integrations.find((i) => i.type === 'google_calendar')
      if (!googleCalendarIntegration?.integrationAgentId) {
        throw new Error('Integração com Google Calendar não encontrada.')
      }

      const response = await fetch(
        `/api/integrations/integration-agents/${googleCalendarIntegration.integrationAgentId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Erro ao desconectar Google Calendar')
      }

      get().setIntegrationStatus('google_calendar', 'disconnected')
      await get().fetchIntegrations(agentId)
      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      get().setIntegrationStatus('google_calendar', 'error', (error as Error).message)
      set({ isLoading: false, error: error as Error })
      return { success: false, error: (error as Error).message }
    }
  },

  checkWhatsappStatus: async () => {
    try {
      const whatsappIntegration = get().integrations.find((i) => i.type === 'whatsapp')

      if (!whatsappIntegration?.integrationAgentId) {
        return { success: true }
      }

      const response = await fetch(
        `/api/integrations/whatsapp/evolution/${whatsappIntegration.integrationAgentId}`,
        {
          credentials: 'include',
        },
      )

      if (!response.ok) {
        await get().updateWhatsappStatusInDatabase(
          whatsappIntegration.integrationAgentId,
          'disconnected',
        )
        get().setIntegrationStatus('whatsapp', 'disconnected')
        return { success: true }
      }

      const { data } = await response.json()
      const { metadata } = data

      const currentStatus = whatsappIntegration.status
      let newStatus: IntegrationStatus

      if (metadata.state === 'open' && (metadata.status === 'connected' || !metadata.qrcode)) {
        newStatus = 'connected'
      } else if (metadata.state === 'close') {
        newStatus = 'disconnected'
      } else if (metadata.qrcode) {
        newStatus = 'connecting'
      } else {
        newStatus = 'disconnected'
      }

      if (currentStatus !== newStatus) {
        await get().updateWhatsappStatusInDatabase(
          whatsappIntegration.integrationAgentId,
          newStatus,
          {
            ...whatsappIntegration.config,
            ...metadata,
            status: newStatus,
            connectedAt:
              newStatus === 'connected'
                ? new Date().toISOString()
                : whatsappIntegration.connectedAt,
          },
        )

        set({
          integrations: get().integrations.map((integration) =>
            integration.type === 'whatsapp'
              ? ({
                  ...integration,
                  status: newStatus,
                  config: {
                    ...integration.config,
                    ...metadata,
                  },
                } as Integration)
              : integration,
          ),
        })
      }

      return { success: true }
    } catch (error) {
      const whatsappIntegration = get().integrations.find((i) => i.type === 'whatsapp')
      if (whatsappIntegration?.integrationAgentId) {
        await get().updateWhatsappStatusInDatabase(
          whatsappIntegration.integrationAgentId,
          'disconnected',
        )
      }
      get().setIntegrationStatus('whatsapp', 'disconnected')
      return { success: false, error: (error as Error).message }
    }
  },

  updateWhatsappStatusInDatabase: async (
    integrationAgentId: number,
    status: IntegrationStatus,
    metadata?: WhatsappMetadata,
  ) => {
    try {
      const whatsappIntegration = get().integrations.find((i) => i.type === 'whatsapp')
      const currentMetadata = whatsappIntegration?.config || {}

      const updatedMetadata = metadata
        ? metadata
        : {
            ...currentMetadata,
            status,
            connectedAt:
              status === 'connected' ? new Date().toISOString() : whatsappIntegration?.connectedAt,
          }

      const response = await fetch(`/api/integrations/integration-agents/${integrationAgentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ metadata: updatedMetadata }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status no banco de dados')
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },

  setIntegrationStatus: (type: IntegrationType, status: IntegrationStatus, error?: string) => {
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.type === type ? { ...integration, status, error } : integration,
      ),
    }))
  },

  disconnectWhatsapp: async (agentId: number) => {
    set({ isLoading: true, error: null })
    try {
      const whatsappIntegration = get().integrations.find((i) => i.type === 'whatsapp')
      if (!whatsappIntegration?.integrationAgentId) {
        throw new Error('Integração com WhatsApp não encontrada.')
      }

      const response = await fetch(
        `/api/integrations/integration-agents/${whatsappIntegration.integrationAgentId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Erro ao desconectar WhatsApp')
      }

      get().setIntegrationStatus('whatsapp', 'disconnected')
      await get().fetchIntegrations(agentId)
      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      get().setIntegrationStatus('whatsapp', 'error', (error as Error).message)
      set({ isLoading: false, error: error as Error })
      return { success: false, error: (error as Error).message }
    }
  },

  saveFacebookConnection: async (agentId: number, accessToken: FacebookAccessToken) => {
    set({ error: null, isLoading: true })
    try {
      get().setIntegrationStatus('whatsapp_oficial', 'connecting')

      const response = await fetch('/api/integrations/facebook/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ agentId, facebookAccessToken: accessToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar dados WhatsApp Oficial')
      }

      const {
        data: {
          id: integrationAgentId,
          organizationIntegrationId,
          metadata: { status, ...config },
        },
      } = await response.json()

      const wpIntegration = {
        type: 'whatsapp_oficial',
        integrationAgentId,
        organizationIntegrationId,
        status: status === 'connected' ? 'connected' : 'connecting',
        config: config as WhatsappOficialConfig,
      } as Integration

      set({
        integrations: [
          ...get().integrations.filter((integration) => integration.type !== 'whatsapp_oficial'),
          wpIntegration,
        ],
        isLoading: false,
      })
      get().setIntegrationStatus('whatsapp_oficial', 'connected')
      return { success: true, data: wpIntegration }
    } catch (error) {
      get().setIntegrationStatus('whatsapp_oficial', 'error', (error as Error).message)
      set({ error: error as Error, isLoading: false })
      return { success: false, error: (error as Error).message }
    }
  },

  getFacebookAccessToken: async (code: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/integrations/facebook/token?code=${code}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao obter token de acesso do Facebook')
      }

      const data = await response.json()
      set({ isLoading: false })

      return { success: true, data }
    } catch (error) {
      set({ isLoading: false, error: error as Error })
      return { success: false, error: (error as Error).message }
    }
  },

  subscribeFacebookApp: async (accessToken: FacebookAccessToken) => {
    set({ error: null, isLoading: true })
    try {
      const response = await fetch('/api/integrations/facebook/subscribe-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accessToken: accessToken.access_token,
          wabaId: accessToken.waba_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao subscrever no app WhatsApp Oficial')
      }
      console.log(await response.json())
      console.log('App WhatsApp Oficial subscrito com sucesso')
      set({ error: null, isLoading: false })
      return { success: true }
    } catch (error) {
      get().setIntegrationStatus('whatsapp_oficial', 'error', (error as Error).message)
      set({ error: error as Error, isLoading: false })
      return { success: false, error: (error as Error).message }
    }
  },

  disconnectWhatsappOficial: async (agentId: number) => {
    set({ isLoading: true, error: null })
    try {
      const whatsappIntegration = get().integrations.find((i) => i.type === 'whatsapp_oficial')
      if (!whatsappIntegration?.integrationAgentId) {
        throw new Error('Integração com WhatsApp Oficial não encontrada.')
      }

      const response = await fetch(
        `/api/integrations/integration-agents/${whatsappIntegration.integrationAgentId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error('Erro ao desconectar WhatsApp Oficial')
      }

      get().setIntegrationStatus('whatsapp_oficial', 'disconnected')
      await get().fetchIntegrations(agentId)
      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      get().setIntegrationStatus('whatsapp_oficial', 'error', (error as Error).message)
      set({ isLoading: false, error: error as Error })
      return { success: false, error: (error as Error).message }
    }
  },

  registerWhatsappNumberOficial: async (phoneNumberId: string, accessToken: string) => {
    set({ error: null, isLoading: true })
    try {
      const response = await fetch(`/api/integrations/facebook/register-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phoneNumberId, accessToken: accessToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao registrar número WhatsApp Oficial')
      }

      console.log('Número WhatsApp Oficial registrado com sucesso')
      set({ error: null, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      return { success: false, error: (error as Error).message }
    }
  },
}))
