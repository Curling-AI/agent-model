import { GenerateContentConfig, GoogleGenAI, Part } from "@google/genai";
import { convertWavToOgg, fileToBase64, saveWaveFile } from "@/utils";
import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import fs from 'fs/promises';

export async function processMediaFromBase64LangchainGemini(
  data: string,
  instruction: string,
  mimeType?: string,
): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    throw new Error("A variável de ambiente GEMINI_API_KEY deve ser definida.");
  }

  const modelName = process.env.LLM_CHAT_MODEL || 'gemini-2.5-flash';
  const chatModel = new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: apiKey,
  });

  try {
    const message = new HumanMessage({
      content: [
        { type: "text", text: instruction },
        {
          type: "media",
          data: data,
          mimeType: mimeType,
        },
      ],
    });

    const response = await chatModel.invoke([message]);

    return response.content.toString();
  } catch (error) {
    console.error("Erro no processamento de mídia:", error);
    throw new Error(`Falha ao processar a mídia com Gemini: ${(error as Error).message}`);
  }
}

export async function textToSpeechGemini(
  filename: string,
  text: string,
  voiceName: string = 'Puck' 
): Promise<string> {
  const audioFilePath = `./uploads/${filename}.wav`;
  const targetFormat = 'ogg';
  const outputFilePath = `./uploads/${filename}.${targetFormat}`;

  const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY || '' });

  const contents: Part[] = [{ text: `Say clearly and with an informative tone: "${text}"` }];

  const config: GenerateContentConfig = {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voiceName,
        },
      },
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: contents,
    config: config,
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  const audioBuffer = Buffer.from(data, 'base64');

  await saveWaveFile(audioFilePath, audioBuffer);

  await convertWavToOgg(audioFilePath, outputFilePath);

  const base64Audio = await fileToBase64(outputFilePath);

  await fs.unlink(audioFilePath);
  await fs.unlink(outputFilePath);

  return base64Audio;
}