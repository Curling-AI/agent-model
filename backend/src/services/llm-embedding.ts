
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { DocumentLoader } from '@langchain/core/document_loaders/base';
import fs from 'fs';
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { insert, upsertArray } from '@/services/storage';
import { TaskType } from '@google/generative-ai';
import { Embeddings } from '@langchain/core/embeddings';


export const generateChunksFromUrl = async (url: string) => {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required.');
  }

  try {
    let loader: DocumentLoader;
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
      loader = YoutubeLoader.createFromUrl(url);
    } else {
      loader = new CheerioWebBaseLoader(url);
    }

    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunks = await splitter.splitDocuments(docs);

    return chunks;
  } catch (error) {
    throw new Error(`Error generating chunks from URL: ${error.message}`);
  }
}

export const generateChunksFromFile = async (filePath: string, extension: string) => {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('File path is required.');
  }

  if (!extension || typeof extension !== 'string') {
    throw new Error('File extension is required.');
  }

  let loader;

  try {
    switch (extension) {
      case 'pdf':
        loader = new PDFLoader(filePath);
        break;
      case 'docx':
      case 'doc':
        loader = new DocxLoader(filePath);
        break;
      case 'txt':
        const text = fs.readFileSync(filePath, 'utf-8');
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const chunks = await splitter.createDocuments([text]);
        return chunks;
      default:
        throw new Error('Unsupported file type.');
    }

    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments(docs);
    
    return chunks;
  } catch (error) {
    throw new Error(`Error generating chunks from file: ${error.message}`);
  } finally {
    if (filePath) {
      fs.unlinkSync(filePath);
    }
  }
}

export const generateChunksFromFaq = async (question: string, answer: string) => {
  try {
    if (!question || !answer || typeof question !== 'string' || typeof answer !== 'string') {
      throw new Error('Question and answer are required.');
    }

      const text = `Q: ${question}\nA: ${answer}`;
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      return await splitter.createDocuments([text]);
  } catch (error) {
    throw new Error(`Error generating chunks from FAQ: ${error.message}`);
  }
};

export async function generateVector(embeddings, agentId: number, documentId: number, chunks: any[]) {
  try {
    const generatedEmbeddings = await embeddings.embedDocuments(chunks);

    const inserts = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: generatedEmbeddings[index],
      agent_id: agentId,
      document_id: documentId,
    }));
    // console.log('Inserts:', inserts);
    return inserts;
  } catch (error) {
    throw new Error(`Error generating vector: ${error.message}`); 
  }
}

function getEmbedding() {
  const provider = process.env.LLM_PROVIDER;
  const apiKey = process.env.LLM_API_KEY;
  const embeddingModel = process.env.LLM_EMBEDDING_MODEL;

  let embeddings: Embeddings;

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
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      });
      break;
    default:
      throw new Error("LLM_PROVIDER não suportado.");
  }

  return embeddings;
}

export async function generateEmbeddingsFromChunks(agentId: number, documentId: number, chunks: any[]) {
  try {
    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return new Response(JSON.stringify({ error: "Chunks inválidos ou ausentes." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let embeddings = getEmbedding();

    if (embeddings instanceof OpenAIEmbeddings) {
    
      await upsertArray('knowledge_openai', await generateVector(embeddings, agentId, documentId, chunks));

    } else if (embeddings instanceof GoogleGenerativeAIEmbeddings) {

      await upsertArray('knowledge_gemini', await generateVector(embeddings, agentId, documentId, chunks));

    } else {
      throw new Error(JSON.stringify({ error: "API não suportada." }));
    }

  } catch (error) {
    console.error("Erro na função:", error.message);
  }
}
