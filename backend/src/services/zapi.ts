export const sendMessage = async (to: string, message: string) => {
  try {
    const response = await fetch(`${process.env.ZAPI_API_URL}/send-text`, {
      headers: {
        'Client-Token': `${process.env.ZAPI_SECURITY_TOKEN}`
      },
      method: 'POST',
      body: JSON.stringify({
        phone: to,
        message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao enviar mensagem: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};