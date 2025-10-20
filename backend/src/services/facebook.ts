
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
      console.log('Error data:', errorData);
      throw new Error(`Error sending media`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending media:', error);
    throw error;
  }
};

export const getMetaMediaContent = async (mediaBodyContent: string, token: string): Promise<string> => {
  console.log('Getting media content for media ID:', mediaBodyContent);
  const mediaId = mediaBodyContent;
  console.log('Using media ID:', token);
  const response = await fetch(`${process.env.FACEBOOK_API_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${mediaId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  const data = await response.json();

  if (!data) {
    throw new Error('Error getting content');
  }

  return data;
}