import fs from 'fs/promises';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { supabase } from '../config/supabaseClient';
import { AgentExecutor } from "langchain/agents";
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { createToolCallingAgent, createOpenAIToolsAgent } from "langchain/agents";
import { getById } from './storage';

export const AiExecutor = {

  executeAgent: async (agentId: number, userId: number, userInput: string) => {
    try {

      const agent = await getById('agents', agentId);

      const tools = await getKnowledgeFromDatabase(agentId, userInput);

      const agentPromptTemplate = ChatPromptTemplate.fromMessages([
          ["system", generateAgentPrompt(agent)],
          new MessagesPlaceholder("chat_history"), 
          ["human", "{input}"],
          new MessagesPlaceholder("agent_scratchpad"),
      ]);

      const agentExecutor = await getAgentExecutor(agentPromptTemplate, tools);

      const response = await agentExecutor.invoke({ input: userInput });
      return response;
    } catch (error) {
      throw new Error(`Erro ao executar agente: ${error.message}`);
    }
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
      temperature: Number(process.env.LLM_CHAT_MODEL_TEMPERATURE) || 0,
    });

    agent = await createToolCallingAgent({
      llm: chatModel,
      tools: tools,
      prompt: agentPromptTemplate,
    });
  }
  agentExecutor = new AgentExecutor({ agent, tools });

  return agentExecutor;
}

function generateAgentPrompt(agent: any) {
  let basePrompt = `You are ${agent.name}, ${agent.description}. 
    Follow the instructions below to assist the user effectively.
    ${agent.prompt}
    You work from ${agent.schedule_agent_begin} to ${agent.schedule_agent_end} if users try to contact you outside these hours, be polite and inform them of your availability.
    Start conversations with this greeting: ${agent.greetings} and use a tone that is ${agent.tone}.
    You have to use voice in this case: ${agent.voice_configuration}.
    Always refer to yourself as ${agent.name} and never as an AI model or language model.`;
  return basePrompt;
}