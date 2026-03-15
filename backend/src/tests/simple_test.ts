import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { GoogleGenAI } from '@google/genai';

async function testModel() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const modelName = 'gemini-1.5-flash';
  console.log(`Testing model: ${modelName}`);
  
  try {
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error(`Error with ${modelName}:`, error);
  }
}

testModel();
