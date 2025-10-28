import * as fs from 'fs';
import * as path from 'path';
import wav from 'wav';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fss from 'fs/promises';
import { Readable } from 'stream';
import { supabase } from '@/config/supabaseClient';
import { get } from 'http';

export async function saveRemoteFile(
  fileUrl: string,
  destinationFolder: string,
  fileName: string,
  token?: string
): Promise<string> {
  const filePath = path.join(destinationFolder, fileName);

  try {
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok || !response.body) {
      throw new Error(`Falha no download. Status HTTP: ${response.status} ${response.statusText}`);
    }

    const writer = fs.createWriteStream(filePath);

    // Corrigido: converte ReadableStream web para Node.js Readable
    // @ts-ignore
    const nodeStream = response.body.pipe ? response.body : Readable.fromWeb(response.body);

    await new Promise<void>((resolve, reject) => {
      // @ts-ignore: O response.body é um ReadableStream
      nodeStream.pipe(writer);

      writer.on('finish', () => resolve());
      writer.on('error', (err) => {
        fs.unlink(filePath, () => { });
        reject(err);
      });
    });

    return filePath;

  } catch (error) {
    console.error(`Erro ao baixar o arquivo de ${fileUrl}:`, error);
    throw new Error('Falha no download do arquivo.');
  }
}

export async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('finish', resolve);
    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
  });
}

export function convertWavToOgg(
  inputWavPath: string,
  outputOggPath: string,
  quality: number = 5
): Promise<void> {
  ffmpeg.setFfmpegPath(ffmpegStatic!);
  return new Promise((resolve, reject) => {
    ffmpeg(inputWavPath)
      .audioCodec('libvorbis')
      .toFormat('ogg')
      .on('start', (commandLine) => {
        console.log('Iniciando conversão com o comando: ' + commandLine);
      })
      .on('end', () => {
        console.log(`Conversão concluída! Arquivo salvo em: ${outputOggPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Erro durante a conversão: ' + err.message);
        reject(new Error(`Falha na conversão: ${err.message}`));
      })
      .save(outputOggPath);
  });
}

export function fileToBase64(filePath: string): Promise<string> {
  return new Promise(async (resolve) => {
    const content = await fss.readFile(filePath);

    const base64Content = content.toString('base64');
    resolve(base64Content);
  });
}

export async function base64ToFile(base64Data: string, filename: string, type: string): Promise<string> {

    const regex = /^data:([a-zA-Z0-9-+\./]+);base64,(.*)$/;
    const match = base64Data.match(regex);

    const mimeType = match ? match[1] : type;
    const rawBase64 = match ? match[2] : base64Data;

    const extensao = getExtensionFromMimeType(mimeType) || null;
    try {
        const binaryData: Buffer = Buffer.from(rawBase64, 'base64');

        await fs.promises.writeFile(`${filename}.${extensao}`, binaryData);

        return `${filename}.${extensao}`;
        
    } catch (error) {
        console.error(`Error on base64ToFile:`, error);
        throw new Error(`Fail on base64ToFile: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function getExtensionFromMimeType(mimeType: string): string | undefined {
  const mimeMap: { [key: string]: string } = {
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/amr': 'amr',
    'audio/mp4': 'mp4',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/3gpp': '3gp',
    'audio/opus': 'opus',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'video/webm': 'webm',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    // Adicione outros conforme necessário
  };

  return mimeMap[mimeType];
}

export async function uploadToSupabaseStorage(
  file: File,
  bucket: string,
  path: string = ''
): Promise<string | null> {
  const filePath = `${path}${Date.now()}_${file.name}`;

  // Upload do arquivo
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Erro ao fazer upload:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl || null;
}

export async function removeFromSupabaseStorage(
  bucket: string,
  filePath: string
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    console.error('Erro ao remover arquivo:', error.message);
    return false;
  }
  return true;
}

export function isBase64String(str: string): boolean {
  // Verifica se é um data URL base64
  return /^data:([a-zA-Z0-9-+\./]+);base64,/.test(str);
}

export function isUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}