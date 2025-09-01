import { encoding_for_model, TiktokenModel } from 'tiktoken'
import { getFinancialParameters } from './costEstimation'

export const estimateTokenCount = (text: string, model: string): number => {
  try {
    if (typeof window !== 'undefined') {
      return Math.ceil(text.length / 4)
    }

    const encoding = encoding_for_model(model as TiktokenModel)
    const tokens = encoding.encode(text)
    const count = tokens.length
    encoding.free()
    return count
  } catch (error) {
    console.warn('Erro ao calcular tokens, usando estimativa:', error)
    return Math.ceil(text.length / 4)
  }
}

export const calculateSystemPromptTokens = async ({
  templateMessage,
  greetingMessage,
  qualifyingQuestions,
  modelName,
}: {
  templateMessage: string
  greetingMessage?: string
  qualifyingQuestions?: string[]
  modelName: string
}): Promise<number> => {
  let totalText = templateMessage || ''

  if (greetingMessage) {
    totalText += ' ' + greetingMessage
  }

  if (qualifyingQuestions && qualifyingQuestions.length > 0) {
    totalText += ' ' + qualifyingQuestions.join(' ')
  }

  return estimateTokenCount(totalText, modelName)
}

export interface TokenCostCalculation {
  totalTokens: number
  costUSD: number
  costBRL: number
  creditsToConsume: number
}

export const calculateTokenCost = async (
  messageText: string,
  model: string,
  costUSD?: number,
): Promise<TokenCostCalculation> => {
  const totalTokens = estimateTokenCount(messageText, model)
  const financialParams = await getFinancialParameters()
  const finalCostUSD = costUSD ?? totalTokens * 0.001
  const costBRL = finalCostUSD * (financialParams?.dollar_value ?? 5.3)
  const creditsToConsume = Math.ceil(costBRL * 100) / 100
  return {
    totalTokens,
    costUSD: Math.round(finalCostUSD * 10000) / 10000,
    costBRL: Math.round(costBRL * 100) / 100,
    creditsToConsume,
  }
}
