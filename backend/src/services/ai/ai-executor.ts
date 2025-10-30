import { getById } from '../storage';
import { processMediaFromBase64LangchainGemini, textToSpeechGemini } from "./gemini";
import { processMediaFromUrlLangchainOpenAI, textToSpeechOpenAI } from "./openai";
import { MainAgent } from "./main-agent";
import { GetCpfCustomerAgent } from './get-cpf-customer-agent';

export const AiExecutor = {
  executeAgentText: async (agentId: number, userId: number, userInput: string) => {
    return await executeAgent(agentId, userId, userInput, null, 'text');
  },

  executeAgentMedia: async (agentId: number, userId: number, mediaContent: any, type: 'audio' | 'image') => {
    return await executeAgent(agentId, userId, '', mediaContent, type);
  },
}

async function executeAgent(agentId: number, userId: number, userInput: string, messageContent: any, type: 'text' | 'audio' | 'image' = 'text') {
  try {
    const sessionId = `user-${userId}-agent-${agentId}`;

    const agent = await getById('agents', agentId);

    const IMAGE_PROMPT = 'Describe the image in detail and provide relevant information.'
    const AUDIO_PROMPT = 'Transcribe the audio to text. The language spoken is portuguese. If there is background noise or multiple speakers, do your best to accurately capture the main content.'

    let message;
    if (type !== 'text' && process.env.LLM_PROVIDER === 'gemini') {
      if (type === 'image') {
        message = await processMediaFromBase64LangchainGemini(messageContent.base64Data, IMAGE_PROMPT, messageContent.mimetype);
      } else if (type === 'audio') {
        message = await processMediaFromBase64LangchainGemini(messageContent.base64Data, AUDIO_PROMPT, messageContent.mimetype);
      }
    } else if (type !== 'text' && process.env.LLM_PROVIDER === 'openai') {
      if (type === 'image') {
        message = await processMediaFromUrlLangchainOpenAI(messageContent.base64Data, 'image', IMAGE_PROMPT);
      } else if (type === 'audio') {
        message = await processMediaFromUrlLangchainOpenAI(messageContent.base64Data, 'audio', AUDIO_PROMPT);
      }
    } else {
      message = userInput;
    }

    const cpfAgent = new GetCpfCustomerAgent();
    const aiMessage = await cpfAgent.call(agent, message, sessionId);

    // const mainAgent = new MainAgent();
    // const aiMessage = await mainAgent.call(agent, message, sessionId);

    if (agent['voice_configuration'] !== 'never' && type === 'audio') {
      let responseAudio = {
        output: message,
        type: 'audio',
        outputText: aiMessage.content,
        responseMetadata: aiMessage.response_metadata,
        usageMetadata: aiMessage['usage_metadata'],
      }

      if (process.env.LLM_PROVIDER === 'openai') {
        responseAudio.output = await textToSpeechOpenAI(aiMessage.content.toString());
      } else if (type === 'audio' && process.env.LLM_PROVIDER === 'gemini') {
        responseAudio.output = await textToSpeechGemini(sessionId, aiMessage.content.toString());
      }

      return responseAudio;
    }

    return {
      outputText: aiMessage.content,
      output: '',
      type: 'text',
      responseMetadata: aiMessage.response_metadata,
      usageMetadata: aiMessage['usage_metadata'],
    };
  } catch (error) {
    console.error('Error executing agent:', error);
    throw new Error(`Erro ao executar agente: ${error.message}`);
  }
}










