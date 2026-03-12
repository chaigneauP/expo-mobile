import OpenAI from 'openai';
import { Message, MessageRole } from '../types';

// API key should be provided via environment variable EXPO_PUBLIC_OPENAI_API_KEY
// Set it in your .env file: EXPO_PUBLIC_OPENAI_API_KEY=sk-...
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!apiKey) {
      throw new Error(
        'OpenAI API key is not configured.\n' +
        'Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file.'
      );
    }
    client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

export function isApiKeyConfigured(): boolean {
  return apiKey.length > 0;
}

export async function sendMessage(
  messages: Message[],
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const openai = getClient();

  const formattedMessages = messages.map((msg) => ({
    role: msg.role as MessageRole,
    content: msg.content,
  }));

  const response = await openai.chat.completions.create({
    model,
    messages: formattedMessages,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response received from the API.');
  }
  return content;
}
