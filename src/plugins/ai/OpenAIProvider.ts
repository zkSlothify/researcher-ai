// src/plugins/enrichers/ai/OpenAIProvider.ts

import { AiProvider } from "../../types";
import { OpenAI } from "openai";

interface OpenAIProviderConfig {
  apiKey: string;
  model?: string;          // e.g., "gpt-3.5-turbo"
  temperature?: number;    // 0.0-1.0
}

export class OpenAIProvider implements AiProvider {
  private openai: OpenAI;
  private model: string;
  private temperature: number;

  constructor(config: OpenAIProviderConfig) {
    const configuration = {
      apiKey: config.apiKey,
    };
    this.openai = new OpenAI(configuration);

    // Provide defaults
    this.model = config.model || "gpt-3.5-turbo";
    this.temperature = config.temperature ?? 0.7;
  }

  public async summarize(prompt: string): Promise<string> {
    try {
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
      };
  
      const { data: chatCompletion, response: raw } = await this.openai.chat.completions.create(params).withResponse();
  
      return chatCompletion.choices[0]?.message?.content || "";
    } catch (e) {
      console.log( e )
      return ""
    }
  }

  public async topics(text: string): Promise<string[]> {
    try {
      const prompt = `Provide up to 3 words that describe the topic of the following text:\n\n"${text}.\n\n Response format MUST be formatted in this way, the words must be strings:\n\n[ \"word1\", \"word2\", \"word3\"]\n`;
  
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
      };
  
      const { data: chatCompletion, response: raw } = await this.openai.chat.completions.create(params).withResponse();

      return JSON.parse(chatCompletion.choices[0]?.message?.content || "[]");
    } catch (e) {
      return []
    }
  }
}