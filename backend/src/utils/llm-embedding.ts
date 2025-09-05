import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const provider = process.env.LLM_PROVIDER;
const apiKey = process.env.LLM_API_KEY;
const embeddingModel = process.env.EMBEDDING_MODEL;

const text = "Exemplo de texto para gerar embedding.";

export async function getEmbedding() {
  let embeddings;
  switch (provider) {
    case "openai":
      embeddings = new OpenAIEmbeddings({
        openAIApiKey: apiKey,
        modelName: embeddingModel,
      });
      break;
    case "gemini":
      embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey,
        model: embeddingModel,
      });
      break;
    default:
      throw new Error("LLM_PROVIDER não suportado.");
  }

  const embedding = await embeddings.embedQuery(text);
  return embedding;
}