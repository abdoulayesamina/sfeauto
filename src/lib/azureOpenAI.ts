import OpenAI from "openai";

export const azureOpenAI = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

export const AZURE_OPENAI_MODEL = process.env.AZURE_OPENAI_MODEL as string;
