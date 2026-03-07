import { GoogleGenAI, Modality } from "@google/genai";

export const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const SYSTEM_INSTRUCTION = `You are Tive, an advanced AI assistant. 
You communicate primarily through voice. 
Keep your responses concise, helpful, and natural. 
You have access to Google Search and Google Maps to provide real-time information.
When using Google Search or Maps, mention that you are looking it up.
If the user asks for a memo, acknowledge it and say you've saved it.`;

export type TiveState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
