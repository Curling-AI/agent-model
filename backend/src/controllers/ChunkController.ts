import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import multer from 'multer';
import { DocumentLoader } from '@langchain/core/document_loaders/base';
import fs from 'fs';

// POST /api/chunks
export const ChunkController = {
  generateChunksFromUrl: async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required.' });
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

      return res.status(200).json({ chunks });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  generateChunksFromFile: async (req: multer.Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    const extension = req.file.originalname.split('.').pop()?.toLowerCase();
    let loader;

    try {
      switch (extension) {
        case 'pdf':
          loader = new PDFLoader(req.file.path);
          break;
        case 'docx':
        case 'doc':
          loader = new DocxLoader(req.file.path);
          break;
        case 'txt':
          const text = fs.readFileSync(req.file.path, 'utf-8');
          const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          });
          const chunks = await splitter.createDocuments([text]);
          return res.status(200).json({ chunks });
        default:
          return res.status(400).json({ error: 'Unsupported file type.' });
      }

      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitDocuments(docs);

      return res.status(200).json({ chunks });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    } finally {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  },

  generateChunksFromFaq: async (req: Request, res: Response) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer || typeof question !== 'string' || typeof answer !== 'string') {
        return res.status(400).json({ error: 'Question and answer are required.' });
      }

      const text = `Q: ${question}\nA: ${answer}`;
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.createDocuments([text]);
      return res.status(200).json({ chunks });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
