import { supabase } from "@/config/supabaseClient";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ReactAgent, tool } from "langchain";
import { BaseAgent } from "./base-agent";

export class MainAgent extends BaseAgent {

  async call(agent: any, message: string, sessionId: string): Promise<any> {

    const agentExecutor = await this.createAgentExecutor(agent, message);

    const response = await agentExecutor.invoke({
      messages: [{ role: 'user', content: message }]
    }, { configurable: { thread_id: sessionId } });

    const aiMessage = response.messages.at(-1);

    return aiMessage
  }

  override async createAgentExecutor(agent: any, message: string): Promise<ReactAgent> {

    const knowledgeTool = tool(
      async () => {
        await this.loadKnowledgeFromDatabase(agent.id, message);
      },
      {
        name: 'get_knowledge',
        description: 'Useful for when you need to get relevant knowledge from the database to answer user questions.',
        returnDirect: true,
      }
    );

    const agentExecutor = await this.buildAgentStructure(this.getSystemPrompt(agent), knowledgeTool ? [knowledgeTool] : []);

    return agentExecutor;
  }

  override async loadKnowledgeFromDatabase(agentId: number, userInput: string): Promise<string[]> {
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

  getSystemPrompt(agent: any) {
    let basePrompt = `You are ${agent.name}, ${agent.description}. 
    Follow the instructions below to assist the user effectively.
    ${agent.prompt}
    You work from ${agent.schedule_agent_begin} to ${agent.schedule_agent_end} if users try to contact you outside these hours, be polite and inform them of your availability.
    Start conversations with this greeting: ${agent.greetings} and use a tone that is ${agent.tone}.
    Ask for CPF or CNPJ at beginning to provide personalized assistance.
    You have to answer using audio messages in this case: ${agent.voice_configuration}.
    Always refer to yourself as ${agent.name} and never as an AI model or language model. 
    It's important that you answer suscintly and objectively. Avoid create long texts.
    If user ask for an audio message and your voice configuration allows it, you have to answer using an audio message, so generates audio files when needed.
    `;
    return basePrompt;
  }
}