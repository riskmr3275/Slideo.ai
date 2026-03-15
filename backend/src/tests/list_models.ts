import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { GoogleGenAI } from '@google/genai';

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  try {
    const models = await ai.models.listModels();
    console.log('Available models:');
    models.models.forEach(m => console.log(m.name));
  } catch (error) {
    console.error('Failed to list models:', error);
  }
}

listModels();
