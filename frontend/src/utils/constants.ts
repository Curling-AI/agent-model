// Constantes para o aplicativo
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const CONVERSATION_TAG_INITIAL_ID = 1
export const CONVERSATION_TAG_IN_CONNECTION_ID = 2
export const CONVERSATION_TAG_QUALIFIED_ID = 3
export const CONVERSATION_TAG_SCHEDULED_ID = 4
export const CONVERSATION_TAG_OPPORTUNITY_ID = 5
export const CONVERSATION_TAG_DISQUALIFIED_ID = 6
export const CONVERSATION_TAG_LOST_ID = 7
export const CONVERSATION_TAG_SALE_COMPLETED_ID = 8

export type IntegrationType = 'google_calendar' | 'whatsapp' | 'instagram' | 'whatsapp_oficial'

export type IntegrationStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export const INTEGRATION_WHATSAPP_EVOLUTION_ID = 1
export const INTEGRATION_META_INSTAGRAM_ID = 2
export const INTEGRATION_GOOGLE_CALENDAR_ID = 3
export const INTEGRATION_WHATSAPP_OFICIAL_ID = 4

export const INTEGRATION_ID_MAP: Record<IntegrationType, number> = {
  whatsapp: INTEGRATION_WHATSAPP_EVOLUTION_ID,
  instagram: INTEGRATION_META_INSTAGRAM_ID,
  google_calendar: INTEGRATION_GOOGLE_CALENDAR_ID,
  whatsapp_oficial: INTEGRATION_WHATSAPP_OFICIAL_ID,
}

export const INTEGRATION_NAME_MAP: Record<number, IntegrationType> = {
  [INTEGRATION_WHATSAPP_EVOLUTION_ID]: 'whatsapp',
  [INTEGRATION_META_INSTAGRAM_ID]: 'instagram',
  [INTEGRATION_GOOGLE_CALENDAR_ID]: 'google_calendar',
  [INTEGRATION_WHATSAPP_OFICIAL_ID]: 'whatsapp_oficial',
}

export const DOCUMENT_PROVIDERS = {
  FILE: 'File',
  WEBSITE: 'Website',
  YOUTUBE: 'Youtube',
  QANDA: 'Q&A',
} as const

export type DocumentProvider = (typeof DOCUMENT_PROVIDERS)[keyof typeof DOCUMENT_PROVIDERS]

export type DocumentProvidersWebhooks = {
  [K in DocumentProvider]: string
}

const checkEnvVar = (name: string, value?: string): value is string => {
  if (!value && !globalThis.window) {
    console.warn(`${name} environment variable is not set`)
    return false
  }
  return true
}

// Verificar e garantir que todas as URLs dos webhooks estão definidas
// const fileWebhookUrl = process.env.DOCUMENT_FILE_PROCESSING_WEBHOOK_URL
// const websiteWebhookUrl = process.env.DOCUMENT_WEBSITE_PROCESSING_WEBHOOK_URL
// const youtubeWebhookUrl = process.env.DOCUMENT_YOUTUBE_PROCESSING_WEBHOOK_URL
// const qandaWebhookUrl = process.env.DOCUMENT_QANDA_PROCESSING_WEBHOOK_URL

// checkEnvVar('DOCUMENT_FILE_PROCESSING_WEBHOOK_URL', fileWebhookUrl)
// checkEnvVar('DOCUMENT_WEBSITE_PROCESSING_WEBHOOK_URL', websiteWebhookUrl)
// checkEnvVar('DOCUMENT_YOUTUBE_PROCESSING_WEBHOOK_URL', youtubeWebhookUrl)
// checkEnvVar('DOCUMENT_QANDA_PROCESSING_WEBHOOK_URL', qandaWebhookUrl)

// export const DOCUMENT_PROVIDERS_WEBHOOKS: DocumentProvidersWebhooks = {
//   [DOCUMENT_PROVIDERS.FILE]: fileWebhookUrl || '',
//   [DOCUMENT_PROVIDERS.WEBSITE]: websiteWebhookUrl || '',
//   [DOCUMENT_PROVIDERS.YOUTUBE]: youtubeWebhookUrl || '',
//   [DOCUMENT_PROVIDERS.QANDA]: qandaWebhookUrl || '',
// }

// export const COOKIE_STORAGE_KEY = 'auth-storage'
