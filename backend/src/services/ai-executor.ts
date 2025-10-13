import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { supabase } from '../config/supabaseClient';
import { AgentExecutor } from "langchain/agents";
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { createToolCallingAgent, createOpenAIToolsAgent } from "langchain/agents";
import { getById } from './storage';
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres";
import { Pool } from "pg";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";
import { OpenAIWhisperAudio } from "@langchain/community/document_loaders/fs/openai_whisper_audio";
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import OpenAI from "openai";
import openai from "openai";
import { GenerateContentConfig, GoogleGenAI, Part } from "@google/genai";
import { LLM } from "@langchain/core/language_models/llms";

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

    const tools = await getKnowledgeFromDatabase(agentId, userInput);

    const IMAGE_PROMPT = 'Describe the image in detail and provide relevant information.'
    const AUDIO_PROMPT = 'Transcribe the audio to text. The language spoken is portuguese. If there is background noise or multiple speakers, do your best to accurately capture the main content.'

    let message;

    const agentPromptTemplate = ChatPromptTemplate.fromMessages([
      ["system", generateAgentPrompt(agent)],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    if (type !== 'text' && process.env.LLM_PROVIDER === 'gemini') {
      if (type === 'image') {
        message = await processMediaFromUrlLangchainGemini(messageContent.base64Data, IMAGE_PROMPT, messageContent.mimetype);
      } else if (type === 'audio') {
        message = await processMediaFromUrlLangchainGemini(messageContent.base64Data, AUDIO_PROMPT, messageContent.mimetype);
      }
    } else if (type !== 'text' && process.env.LLM_PROVIDER === 'openai') {
      if (type === 'image') {
        message = await processMediaFromUrlLangchainOpenAI(messageContent.fileURL, 'image', IMAGE_PROMPT);
      } else if (type === 'audio') {
        message = await processMediaFromUrlLangchainOpenAI(messageContent.fileURL, 'audio', AUDIO_PROMPT);
      }
    } else {
      message = userInput;
    }
    
    const agentExecutor = await getAgentExecutor(agentPromptTemplate, tools);
    const runnableWithHistory = await createRunnableWithMessageHistory(sessionId, agentExecutor);
    const response = await runnableWithHistory.invoke({ input: message }, { configurable: { sessionId } });

    if (type === 'audio' && process.env.LLM_PROVIDER === 'openai') {
      return await textToSpeechOpenAI(response.output);
    } else if (type === 'audio' && process.env.LLM_PROVIDER === 'gemini') {
      return await textToSpeechGemini(response.output);
    }

    return response.output;
  } catch (error) {
    console.error('Error executing agent:', error);
    throw new Error(`Erro ao executar agente: ${error.message}`);
  }
}

async function getKnowledgeFromDatabase(agentId: number, userInput: string) {
  let knowledge: string[] = [];
  let functionName = '';
  let embedding = [];
  if (process.env.LLM_PROVIDER === 'openai') {
    functionName = 'match_knowledge_openai';
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.LLM_API_KEY,
      modelName: process.env.LLM_EMBEDDING_MODEL || "text-embedding-3-small",
    });
    embedding = await embeddings.embedDocuments([userInput]);
  } else if (process.env.LLM_PROVIDER === 'gemini') {
    functionName = 'match_knowledge_gemini';
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.LLM_API_KEY,
      modelName: process.env.LLM_EMBEDDING_MODEL || "models/embedding-001",
    });
    embedding = await embeddings.embedDocuments([userInput]);
  }

  const { data: ragData } = await supabase.rpc(functionName, {
    query_embedding: embedding,
    match_count: 3,
    filter: JSON.stringify({ agent_id: agentId })
  });
  knowledge = ragData?.map((item: any) => item.content) || [];
  return knowledge;
}

async function getAgentExecutor(agentPromptTemplate: ChatPromptTemplate, tools: any[]) {
  let agentExecutor: AgentExecutor;
  let agent;
  if (process.env.LLM_PROVIDER === 'openai') {
    const chatModel = new ChatOpenAI({
      model: process.env.LLM_CHAT_MODEL || 'gpt-4o',
      temperature: Number(process.env.LLM_CHAT_MODEL_TEMPERATURE) || 0,
    });

    agent = await createOpenAIToolsAgent({
      llm: chatModel,
      tools: tools,
      prompt: agentPromptTemplate,
    });

  } else if (process.env.LLM_PROVIDER === 'gemini') {
    const chatModel = new ChatGoogleGenerativeAI({
      model: process.env.LLM_CHAT_MODEL || 'gemini-2.5-pro',
      apiKey: process.env.LLM_API_KEY,
      temperature: Number(process.env.LLM_CHAT_MODEL_TEMPERATURE) || 0,
    });

    agent = await createToolCallingAgent({
      llm: chatModel,
      tools: tools,
      prompt: agentPromptTemplate,
    });
  }
  agentExecutor = new AgentExecutor({ agent, tools, verbose: process.env.LLM_LOGGER_ENABLED === 'true' });

  return agentExecutor;
}

function generateAgentPrompt(agent: any) {
  let basePrompt = `You are ${agent.name}, ${agent.description}. 
    Follow the instructions below to assist the user effectively.
    ${agent.prompt}
    You work from ${agent.schedule_agent_begin} to ${agent.schedule_agent_end} if users try to contact you outside these hours, be polite and inform them of your availability.
    Start conversations with this greeting: ${agent.greetings} and use a tone that is ${agent.tone}.
    You have to answer using audio messages in this case: ${agent.voice_configuration}.
    Always refer to yourself as ${agent.name} and never as an AI model or language model.`;
  return basePrompt;
}

async function createRunnableWithMessageHistory(sessionId: string, agentExecutor: AgentExecutor) {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_POSTGRES_URL,
  });

  const agentWithHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (sessionId) => new PostgresChatMessageHistory({
      pool,
      sessionId,
      tableName: "chat_messages",
    }),

    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
    config: { configurable: { sessionId: sessionId } },
  });

  return agentWithHistory;
}

async function processMediaFromUrlLangchainOpenAI(
  url: string,
  mediaType: 'audio' | 'image',
  instruction: string,
  language?: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("A variável de ambiente OPENAI_API_KEY deve ser definida.");
  }

  const visionModelName = process.env.AI_MODEL_VISION || 'gpt-4o';
  const chatModel = new ChatOpenAI({
    modelName: visionModelName,
    temperature: 0,
    apiKey: apiKey,
  });

  if (mediaType === 'image') {
    const message = new HumanMessage({
      content: [
        {
          type: "image_url",
          image_url: {
            url: url,
            detail: "high",
          },
        },
        { type: "text", text: instruction },
      ],
    });

    const response = await chatModel.invoke([message]);

    return response.content.toString();

  } else if (mediaType === 'audio') {
    let tempFilePath: string | undefined;

    try {
      const fetchResponse = await fetch(url);

      if (!fetchResponse.ok) {
        throw new Error(`Falha ao baixar o áudio: ${fetchResponse.statusText}`);
      }

      const arrayBuffer = await fetchResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const contentType = fetchResponse.headers.get('content-type') || 'audio/mp3';
      const extension = contentType.split('/')[1] || 'mp3';

      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `audio-${Date.now()}.${extension}`);

      await fs.writeFile(tempFilePath, audioBuffer);

      const loader = new OpenAIWhisperAudio(tempFilePath, {
        transcriptionCreateParams: {
          language: language,
          prompt: instruction,
        },
      });

      const docs = await loader.load();

      if (docs.length === 0) {
        throw new Error("O Loader do Whisper não retornou nenhuma transcrição.");
      }

      const transcription = docs[0].pageContent;

      return transcription;

    } catch (error) {
      console.error("Erro no processamento de áudio:", error);
      throw new Error(`Falha ao transcrever o áudio: ${(error as Error).message}`);
    } finally {
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch (cleanUpError) {
          console.warn(`Aviso: Não foi possível remover o arquivo temporário: ${tempFilePath}`);
        }
      }
    }
  } else {
    throw new Error(`Tipo de mídia não suportado: ${mediaType}. Use 'audio' ou 'image'.`);
  }
}

async function processMediaFromUrlLangchainGemini(
  data: string,
  instruction: string,
  mimeType?: string,
): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error("A variável de ambiente GEMINI_API_KEY deve ser definida.");
  }

  const modelName = process.env.LLM_CHAT_MODEL || 'gemini-2.5-flash';
  const chatModel = new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: apiKey,
  });

  try {
    const message = new HumanMessage({
      content: [
        { type: "text", text: instruction },
        {
          type: "media",
          data: data,
          mimeType: mimeType,
        },
      ],
    });

    const response = await chatModel.invoke([message]);

    return response.content.toString();
  } catch (error) {
    console.error("Erro no processamento de áudio:", error);
    throw new Error(`Falha ao processar o áudio com Gemini: ${(error as Error).message}`);
  }
}

async function textToSpeechOpenAI(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
    model: 'gpt-4o-mini-tts' | 'tts-1' | 'tts-1-hd' = 'gpt-4o-mini-tts'
): Promise<string> {
    const openai = new OpenAI({
        apiKey: process.env.LLM_API_KEY,
    });
    const response = await openai.audio.speech.create({
        model: model,
        voice: voice,
        input: text,
        response_format: "mp3",
    });

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return audioBuffer.toString('base64');;
}

async function textToSpeechGemini(
    text: string,
    voiceName: string = 'Kore' // Exemplo de voz Gemini-TTS
): Promise<Buffer> {
    const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY || '' });

    const contents: Part[] = [{ text: `Say clearly and with an informative tone: "${text}"` }];

    // Configuração para Text-to-Speech (TTS)
    const config: GenerateContentConfig = {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: voiceName,
                },
            },
        },
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: contents,
        config: config,
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('audio/'));

    if (audioPart && audioPart.inlineData?.data) {
        console.log("Conversão concluída. Áudio Base64 gerado.");
        return Buffer.from(audioPart.inlineData.data, 'base64');
    }

    throw new Error('O modelo Gemini-TTS não retornou o conteúdo de áudio esperado.');
}


