import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, ReactAgent, summarizationMiddleware } from "langchain";

export abstract class BaseAgent {
  abstract call(agent: any, message: string, sessionId: string): Promise<any>;
  
  abstract getSystemPrompt(agent: any): string;

  abstract createAgentExecutor(agent: any, message: string): Promise<ReactAgent>;
  
  async loadKnowledgeFromDatabase(agentId: number, userInput: string): Promise<string[]> {
    return [];
  }

  async buildAgentStructure(agentPromptTemplate: string, tools: any[]): Promise<ReactAgent> {

    const checkpointer = PostgresSaver.fromConnString(process.env.SUPABASE_POSTGRES_URL);
    await checkpointer.setup();

    let agent: ReactAgent;
    let chatModel: BaseChatModel;
    if (process.env.LLM_PROVIDER === 'openai') {
      chatModel = new ChatOpenAI({
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_CHAT_MODEL || 'gpt-4o',
        temperature: Number(process.env.LLM_CHAT_MODEL_TEMPERATURE) || 0,
      });

    } else if (process.env.LLM_PROVIDER === 'gemini') {
      chatModel = new ChatGoogleGenerativeAI({
        model: process.env.LLM_CHAT_MODEL || 'gemini-2.5-pro',
        apiKey: process.env.LLM_API_KEY,
        temperature: Number(process.env.LLM_CHAT_MODEL_TEMPERATURE) || 0,
      });
    }

    agent = createAgent({
      model: chatModel,
      tools: tools,
      systemPrompt: agentPromptTemplate,
      checkpointer,
      middleware: [
        summarizationMiddleware({
          model: chatModel,
          maxTokensBeforeSummary: 4000,
          messagesToKeep: process.env.LLM_MAX_HISTORY_TURNS ? parseInt(process.env.LLM_MAX_HISTORY_TURNS) : 10,
        }),
      ],
    });

    return agent;
  }

}