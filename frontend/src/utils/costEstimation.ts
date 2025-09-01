// import { CostEstimationParams } from '@/pages/api/cost-estimation'
import { calculateSystemPromptTokens } from '@/utils/tokenEstimator'

export interface CostEstimationResult {
  totalCostBRL: number
  breakdown: {
    llmCost: number
    ttsCost: number
  }
}

export type ModelPricing = {
  id: number
  name: string
  price_input_usd: number
  price_output_usd: number
}

export type FinancialParameters = {
  dollar_value: number
  iof_percent?: number
  tax_percent?: number
  markup_percent?: number
}

export type TTSProvider = 'elevenlabs' | 'google'

export type VoiceUsageType = 'always' | 'when_voice_message' | 'when_asked' | 'never'

const TTS_BASE_COSTS: Record<TTSProvider, number> = {
  elevenlabs: 0.048,
  google: 0.032,
}

const VOICE_USAGE_PERCENTAGES: Record<VoiceUsageType, number> = {
  always: 1.0,
  when_voice_message: 0.25,
  when_asked: 0.1,
  never: 0.0,
}

export const getModelInfo = async (modelId: number): Promise<ModelPricing | null> => {
  // try {
  //   const { data, error } = await supabase
  //     .from('models')
  //     .select('id, name, price_input_usd, price_output_usd')
  //     .eq('id', modelId)
  //     .single()

  //   if (error) {
  //     console.error('Erro ao buscar preços do modelo:', error)
  //     return null
  //   }

  //   return data
  // } catch (error) {
  //   console.error('Erro ao buscar modelo:', error)
  //   return null
  // }
  return null
}

export const getFinancialParameters = async (): Promise<FinancialParameters | null> => {
  // try {
  //   const { data, error } = await supabase
  //     .from('financial_parameters')
  //     .select('dollar_value, iof_percent, tax_percent, markup_percent')
  //     .single()

  //   if (error || !data || typeof data.dollar_value !== 'number') {
  //     console.error('Erro ao buscar parâmetros financeiros:', error)
  //     return null
  //   }
  //   return data
  // } catch (error) {
  //   console.error('Erro ao buscar parâmetros financeiros:', error)
  //   return null
  // }
  return null
}

export const calculateMessageCostEstimation = async (
  params: CostEstimationResult,
): Promise<CostEstimationResult | null> => {

  return null
  // try {
  //   const [modelInfo, financialParameters] = await Promise.all([
  //     getModelInfo(params.modelId),
  //     getFinancialParameters(),
  //   ])

  //   if (!modelInfo) {
  //     throw new Error('Model pricing not found')
  //   }
  //   if (!financialParameters) {
  //     throw new Error('Financial parameters not found')
  //   }

  //   const systemPromptTokens = await calculateSystemPromptTokens({
  //     greetingMessage: params.greetingMessage,
  //     qualifyingQuestions: params.qualifyingQuestions,
  //     modelName: modelInfo.name,
  //     templateMessage: params.templateMessage,
  //   })
  //   const FIXED_OUTPUT_TOKENS = 50

  //   const llmInputCost = systemPromptTokens * (modelInfo.price_input_usd / 1000000)
  //   const llmOutputCost = FIXED_OUTPUT_TOKENS * (modelInfo.price_output_usd / 1000000)

  //   const ttsBaseCost = TTS_BASE_COSTS[params.ttsProvider]
  //   const voiceUsageMultiplier = VOICE_USAGE_PERCENTAGES[params.voiceUsageType]
  //   const ttsCost = ttsBaseCost * voiceUsageMultiplier

  //   const llmCost = llmInputCost + llmOutputCost

  //   const totalCostUSD = llmInputCost + llmOutputCost + ttsCost
  //   let totalCostBRL = totalCostUSD * financialParameters.dollar_value

  //   if (
  //     financialParameters.iof_percent &&
  //     financialParameters.markup_percent &&
  //     financialParameters.tax_percent
  //   ) {
  //     totalCostBRL =
  //       totalCostBRL *
  //       (1 +
  //         (financialParameters.iof_percent +
  //           financialParameters.tax_percent +
  //           financialParameters.markup_percent) /
  //           100)
  //   }

  //   return {
  //     totalCostBRL: totalCostBRL,
  //     breakdown: {
  //       llmCost,
  //       ttsCost,
  //     },
  //   }
  // } catch (error) {
  //   console.error('Error calculating cost estimation:', error)
  //   return null
  // }
}
