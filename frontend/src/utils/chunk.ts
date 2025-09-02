import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { DocumentLoader } from 'langchain/document_loaders/base';
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";


// Função para criar chunks de texto
async function chunkDocuments(docs: Document[], chunkSize = 1000, chunkOverlap = 200) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  return await splitter.splitDocuments(docs);
}

async function chunkText(text: string, chunkSize = 1000, chunkOverlap = 200) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  return await splitter.createDocuments([text]);
}

// Função para processar arquivo enviado
export async function processFile(file: File) {
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  console.log("File extension:", file);
  switch (extension) {
    case "pdf":
      const pdfLoader = new PDFLoader(file);
      return await generateChunks(pdfLoader);
    case "docx":
      const docxLoader = new DocxLoader(file);
      return await generateChunks(docxLoader);
    case "txt":
      const text = await file.text();
      const chunks = await chunkText(text);
      return chunks;
    default:
      throw new Error("Unsupported file type");
  }
}

// Função para processar vídeo do YouTube
export async function processYoutube(url: string, language: string = 'pt') {
  const loader = YoutubeLoader.createFromUrl(url, {
    language,
    addVideoInfo: true,
  });
  return await generateChunks(loader);
}

// Função para processar website
export async function processWebsite(url: string) {
  const loader = new CheerioWebBaseLoader(url);
  return await generateChunks(loader);
}

async function generateChunks(loader: DocumentLoader) {
  const docs: Document[] = await loader.load();
  const chunks = await chunkDocuments(docs);
  return chunks;
}