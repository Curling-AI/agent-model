import { ReactAgent, tool } from "langchain";
import { BaseAgent } from "./base-agent";

export class GetCpfCustomerAgent extends BaseAgent {
  async call(agent: any, message: string, sessionId: string): Promise<any> {
    const agentExecutor = await this.createAgentExecutor(agent, message);

    const response = await agentExecutor.invoke({
      messages: [{ role: 'user', content: message }]
    }, { configurable: { thread_id: sessionId } });

    const aiMessage = response.messages.at(-1);

    return aiMessage
  }

  override getSystemPrompt(agent: any): string {
    const systemPrompt = `
    Você é um agente que encontra número de CPF ou CNPJ em uma mensagem de texto vinda do usuário. 
    Sua tarefa é encontrar esse número e retorná-lo sem qualquer outra explicação.
    Siga as instruções abaixo para ajudar o usuário de forma eficaz:
    - Se o CPF/CNPJ for encontrado, retorne apenas o número, sem qualquer outra explicação.
    - Se não houver CPF/CNPJ na mensagem, responda que não foi possível encontrar o número.
    `;
    return systemPrompt;
  }

  override async createAgentExecutor(agent: any, message: string): Promise<ReactAgent> {
    const cpfTool = tool(
      async () => {
        const cpfs = await this.extractCpfOrCnpj(message);
        return cpfs[0];
      },
      {
        name: 'get_cpf_customer',
        description: 'Useful for extracting CPF/CNPJ numbers from the user input to retrieve customer information.',
      }
    );

    const agentExecutor = await this.buildAgentStructure(this.getSystemPrompt(agent), cpfTool ? [cpfTool] : []);

    return agentExecutor;
  }

  private extractCpfOrCnpj(text: string): string[] {
    const cpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/g;
    const cnpjRegex = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b|\b\d{14}\b/g;
    const cpfs = text.match(cpfRegex) || [];
    const cnpjs = text.match(cnpjRegex) || [];
    return [...cpfs, ...cnpjs];
  }
}