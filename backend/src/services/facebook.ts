
import { base64ToFile, fileToBase64, getExtensionFromMimeType, saveRemoteFile } from "@/utils";
import fss from 'fs/promises';
import FormDataLib from "form-data";
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosRequestConfig } from 'axios';

export const sendMetaMessage = async (wpNumberId: string, to: string, message: string, token: string) => {
  try {

    const payload = JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: true,
        body: message
      }
    });

    const response = await fetch(`${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${wpNumberId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: payload
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error(`Error sending message: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const sendMetaMedia = async (wpNumberId: string, to: string, media: string, type: string, mimeType: string, token: string) => {
  try {
    const filePath = await base64ToFile(media, `./uploads/${Date.now()}`, mimeType);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado no caminho: ${filePath}`);
    }
    
    const mediaFileName = path.basename(filePath);
    
    const formData = new FormDataLib();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', fs.createReadStream(filePath), {
      filename: mediaFileName,
      contentType: mimeType
    });

    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${token}`,
    };

    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${wpNumberId}/media`,
      headers: headers,
      data: formData,
    };

    const response = await axios(config);

    if (response.status !== 200) {
      console.log('Error data:', response.data);
      throw new Error(`Error sending media`);
    }

    fss.unlink(filePath);

    let payload = {
        messaging_product: 'whatsapp',
        recipient_type: "individual",
        to: to,
    };

    switch (type) {
      case 'audio':
        payload['type'] = "audio";
        payload['audio'] = { id: response.data.id, voice: true };
        break;
      case 'image':
        payload['type'] = "image";
        payload['image'] = { id: response.data.id };
        break;
      case 'document':
        payload['type'] = "document";
        payload['document'] = { id: response.data.id };
        break;
      case 'video':
        payload['type'] = "video";
        payload['video'] = { id: response.data.id };
        break;
      default:
        payload['type'] = "audio";
        payload['audio'] = {
          id: response.data.id
        };
    }
    console.log('Payload for message:', payload);
    const messageResponse = await fetch(`${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${wpNumberId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(payload)
    });

    console.log('Message response status:', await messageResponse.json());
  } catch (error) {
    console.error('Error sending media:', error);
    throw error;
  }
};

export const getMetaMediaContent = async (mediaBodyContent: any, token: string): Promise<any> => {
  const mediaId = mediaBodyContent.type === 'image' ? mediaBodyContent.image.id : mediaBodyContent.audio.id;

  const response = await fetch(`${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${mediaId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  const data = await response.json();

  if (!data) {
    throw new Error('Error getting content');
  }

  const filePath = await saveRemoteFile(
    data.url,
    './uploads', `media_${mediaId}.${getExtensionFromMimeType(
      mediaBodyContent.type === 'image' ? mediaBodyContent.image.mime_type : mediaBodyContent.audio.mime_type
    )}`,
    token
  );

  let base64Data: string;
  if (process.env.LLM_PROVIDER === 'gemini') {
    base64Data = await fileToBase64(filePath);
  } else {
    base64Data = `data:${data.mime_type};base64,${await fileToBase64(filePath)}`;
  }

  await fss.unlink(filePath);

  return {
    base64Data: base64Data,
    mimetype: data.mime_type,
  };
}