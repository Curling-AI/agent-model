import { StructuredTool } from "@langchain/core/tools";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { z } from "zod";

export class WebsiteKnowledgeTool extends StructuredTool {
  name = "website_knowledge_reader";
  description = `Use esta ferramenta EXCLUSIVAMENTE para responder perguntas sobre o conteúdo do site ${TARGET_URL}. Use-a apenas se o Agente não souber a resposta.`;

  schema = z.object({
    query: z.string().describe("A pergunta reformulada para buscar no conhecimento do site."),
  });

  private retriever: VectorStoreRetriever;

  constructor(retriever: VectorStoreRetriever) {
    super();
    this.retriever = retriever;
  }

  protected async _call(arg: { query: string }): Promise<string> {
    const documents = await this.retriever.invoke(arg.query);
    return documents.map(doc => `[Contexto do Site] ${doc.pageContent}`).join('\n---\n');
  }
}