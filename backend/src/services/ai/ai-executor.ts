import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { supabase } from '../../config/supabaseClient';
import { AgentExecutor } from "langchain/agents";
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { createToolCallingAgent, createOpenAIToolsAgent } from "langchain/agents";
import { getById } from '../storage';
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres";
import { Pool } from "pg";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { processMediaFromBase64LangchainGemini, textToSpeechGemini } from "./gemini";
import { processMediaFromUrlLangchainOpenAI, textToSpeechOpenAI } from "./openai";

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
        message = await processMediaFromBase64LangchainGemini(messageContent.base64Data, IMAGE_PROMPT, messageContent.mimetype);
      } else if (type === 'audio') {
        message = await processMediaFromBase64LangchainGemini(messageContent.base64Data, AUDIO_PROMPT, messageContent.mimetype);
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


    if (agent['voice_configuration'] !== 'never' && type === 'audio') {
      let responseAudio = {
        output: message,
        type: 'audio',
        outputText: response.output
      }

      if (process.env.LLM_PROVIDER === 'openai') {
        responseAudio.output = await textToSpeechOpenAI(response.output);
      } else if (type === 'audio' && process.env.LLM_PROVIDER === 'gemini') {
        responseAudio.output = await textToSpeechGemini(sessionId, response.output);
      }

      return responseAudio;
    }

    return {
      outputText: response.output,
      output: response.output,
      type: 'text'
    };
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
    Always refer to yourself as ${agent.name} and never as an AI model or language model. 
    It's important that you answer suscintly and objectively. Avoid create long texts.
    If user ask for an audio message and your voice configuration allows it, you have to answer using an audio message, so generates audio files when needed.
    `;
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







