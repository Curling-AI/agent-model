import * as fs from 'fs';
import * as path from 'path';

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