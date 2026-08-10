import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAzureOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
    });
  }

  return client;
}

export const AZURE_OPENAI_MODEL = process.env.AZURE_OPENAI_MODEL as string;
