import { BASE_URL } from '@/utils/constants';
export const generateChunksFromFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/api/chunks/generate-from-file`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Erro ao processar arquivo');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao processar arquivo');
  }
}

export const generateChunksFromUrl = async (url: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/chunks/generate-from-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Erro ao processar URL');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao processar URL');
  }
}

export const generateChunksFromFaq = async (question: string, answer: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/chunks/generate-from-faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    });
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Erro ao processar URL');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao processar URL');
  }
}