
import { getByFilter } from "./storage";

export const sendMessage = async (to: string, message: string, token: string) => {
  try {
    const response = await fetch(`${process.env.UAZAPI_API_URL}/send/text`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        number: to,
        text: message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error sending message: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const sendMedia = async (to: string, media: string, type: string, token: string) => {
  try {
    const response = await fetch(`${process.env.UAZAPI_API_URL}/send/media`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        number: to,
        type,
        file: media
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error sending media: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending media:', error);
    throw error;
  }
};

export const registerWebhook = async () => {
  await fetch(`${process.env.UAZAPI_API_URL}/globalwebhook`, {
    headers: {
      'admintoken': `${process.env.UAZAPI_ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      url: process.env.UAZAPI_WEBHOOK_URL,
      events: ['messages', 'connection'],
      excludeMessages: ['wasSentByApi']
    })
  });
};

export const createInstance = async (name: string) => {
  const response = await fetch(`${process.env.UAZAPI_API_URL}/instance/init`, {
    headers: {
      'admintoken': `${process.env.UAZAPI_ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      name: name
    })
  });

  const data = await response.json();
  return data;
}

export const deleteInstance = async (token: string) => {
  const response = await fetch(`${process.env.UAZAPI_API_URL}/instance`, {
    headers: {
      'token': token
    },
    method: 'DELETE'
  });
  const data = await response.json();
  return data;
}

export const generateQrCode = async (token: string) => {
  const response = await fetch(`${process.env.UAZAPI_API_URL}/instance/connect`, {
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    method: 'POST',
    body: JSON.stringify({
    })
  });
  const data = await response.json();
  return data;
}

export const getTokenFromInstance = async (instance: string): Promise<string> => {
  const instances = await getByFilter('integrations', { 'metadata->instance->>name': instance });
  
  if (instances.length > 0) {
    return instances[0]['metadata']['instance']['token'];
  }
  throw new Error('Instance not found');
}

export const getMediaContent = async (messageId: string, token: string): Promise<string> => {
  
  let payload = {
    id: messageId,
    return_base64: true,
    return_link: true,
  };

  if (process.env.LLM_PROVIDER === 'openai') {
    payload['transcribe'] = true;
    payload['openai_apikey'] = process.env.LLM_API_KEY;
  }
  
  const response = await fetch(`${process.env.UAZAPI_API_URL}/message/download`, {
    headers: {
      'Content-Type': 'application/json',
      'token': token
    },
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!data) {
    throw new Error('Error getting content');
  }

  return data;
}