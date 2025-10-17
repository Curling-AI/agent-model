import * as fs from 'fs';
import * as path from 'path';
import wav from 'wav';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fss from 'fs/promises';

export async function saveRemoteFile(
  fileUrl: string,
  destinationFolder: string,
  fileName: string
): Promise<string> {
  const filePath = path.join(destinationFolder, fileName);

  try {
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    const response = await fetch(fileUrl, {
      method: 'GET',
    });

    if (!response.ok || !response.body) {
      throw new Error(`Falha no download. Status HTTP: ${response.status} ${response.statusText}`);
    }

    const writer = fs.createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      // @ts-ignore: O response.body é um ReadableStream
      response.body.pipe(writer); 

      writer.on('finish', () => resolve());
      writer.on('error', (err) => {
        fs.unlink(filePath, () => {}); 
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

export function convertWavToMp3(
  inputWavPath: string,
  outputMp3Path: string,
  bitrate: string = '192k'
): Promise<void> {
  ffmpeg.setFfmpegPath(ffmpegStatic!);
  return new Promise((resolve, reject) => {
    ffmpeg(inputWavPath)
      .toFormat('mp3')
      .audioBitrate(bitrate)
      .on('start', (commandLine) => {
        console.log('Iniciando conversão com o comando: ' + commandLine);
      })
      .on('end', () => {
        console.log(`Conversão concluída! Arquivo salvo em: ${outputMp3Path}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Erro durante a conversão: ' + err.message);
        reject(new Error(`Falha na conversão: ${err.message}`));
      })
      .save(outputMp3Path);
  });
}

export function fileToBase64(filePath: string): Promise<string> {
  return new Promise(async (resolve) => {
    const content = await fss.readFile(filePath);

    const base64Content = content.toString('base64');
    resolve(base64Content);
  });
}