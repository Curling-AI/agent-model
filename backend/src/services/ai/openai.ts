import { HumanMessage } from "@langchain/core/messages";
import { OpenAIWhisperAudio } from "@langchain/community/document_loaders/fs/openai_whisper_audio";
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import OpenAI from "openai";
import { ChatOpenAI } from '@langchain/openai';
import { is } from "cheerio/dist/commonjs/api/traversing";
import { isUrl } from "@/utils";

export async function processMediaFromUrlLangchainOpenAI(
  url: string,
  mediaType: 'audio' | 'image',
  instruction: string,
  language?: string,
): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error("A variável de ambiente LLM_API_KEY deve ser definida.");
  }

  const visionModelName = process.env.AI_MODEL_VISION || 'gpt-4o';
  const chatModel = new ChatOpenAI({
    modelName: visionModelName,
    temperature: 0,
    apiKey: apiKey,
  });

  if (mediaType === 'image') {
    const message = new HumanMessage({
      content: [
        {
          type: "image_url",
          image_url: {
            url: url,
            detail: "high",
          },
        },
        { type: "text", text: instruction },
      ],
    });
    
    const response = await chatModel.invoke([message]);
    
    return response.content.toString();
  } else if (mediaType === 'audio') {
    let tempFilePath: string | undefined;
    let audioBuffer: Buffer;
    let extension = 'ogg';
    try {
      if (isUrl(url)) {
        const fetchResponse = await fetch(url);

        if (!fetchResponse.ok) {
          throw new Error(`Falha ao baixar o áudio: ${fetchResponse.statusText}`);
        }

        const arrayBuffer = await fetchResponse.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);

        const contentType = fetchResponse.headers.get('content-type') || 'audio/mp3';
        extension = contentType.split('/')[1] || 'mp3';

      } else {
        audioBuffer = Buffer.from(url.split(',')[1], 'base64');
      }

      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `audio-${Date.now()}.${extension}`);

      await fs.writeFile(tempFilePath, audioBuffer);

      const loader = new OpenAIWhisperAudio(tempFilePath, {
        clientOptions: { 
          apiKey: apiKey,
        },
        transcriptionCreateParams: {
          language: language,
          prompt: instruction,
        },
      });

      const docs = await loader.load();

      if (docs.length === 0) {
        throw new Error("O Loader do Whisper não retornou nenhuma transcrição.");
      }

      const transcription = docs[0].pageContent;

      return transcription;

    } catch (error) {
      console.error("Erro no processamento de áudio:", error);
      throw new Error(`Falha ao transcrever o áudio: ${(error as Error).message}`);
    } finally {
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch (cleanUpError) {
          console.warn(`Aviso: Não foi possível remover o arquivo temporário: ${tempFilePath}`);
        }
      }
    }
  } else {
    throw new Error(`Tipo de mídia não suportado: ${mediaType}. Use 'audio' ou 'image'.`);
  }
}



export async function textToSpeechOpenAI(
  text: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
  model: 'gpt-4o-mini-tts' | 'tts-1' | 'tts-1-hd' = 'gpt-4o-mini-tts'
): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
  });
  const response = await openai.audio.speech.create({
    model: model,
    voice: voice,
    input: text,
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);

  return `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
}