// src/plugins/ai/OpenAIProvider.ts

import { AiProvider } from "../../types";
import OpenAI from "openai";

interface OpenAIProviderConfig {
  apiKey: string;
  model?: string;          
  temperature?: number;    
  useOpenRouter?: boolean;
  siteUrl?: string;      
  siteName?: string;     
}

export class OpenAIProvider implements AiProvider {
  private openai: OpenAI;
  private model: string;
  private temperature: number;

  constructor(config: OpenAIProviderConfig) {
    // Initialize configuration
    const openAIConfig: any = {
      apiKey: config.apiKey
    };

    // Configure OpenRouter if enabled
    if (config.useOpenRouter) {
      openAIConfig.baseURL = "https://openrouter.ai/api/v1";
      // Set required headers for OpenRouter
      openAIConfig.defaultHeaders = {
        "HTTP-Referer": config.siteUrl || "",
        "X-Title": config.siteName || "",
      };
      // For OpenRouter, if no model prefix is specified, add the openai/ prefix
      this.model = config.model?.includes("/") ? config.model : `openai/${config.model || "gpt-3.5-turbo"}`;
    } else {
      this.model = config.model || "gpt-3.5-turbo";
    }

    this.openai = new OpenAI(openAIConfig);
    this.temperature = config.temperature ?? 0.7;
  }

  public async summarize(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature
      });

      return completion.choices[0]?.message?.content || "";
    } catch (e) {
      console.error("Error in summarize:", e);
      throw e;
    }
  }

  public async topics(text: string): Promise<string[]> {
    try {
      const prompt = `Provide up to 6 words that describe the topic of the following text:\n\n"${text}.\n\n Response format MUST be formatted in this way, the words must be strings:\n\n[ \"word1\", \"word2\", \"word3\"]\n`;
  
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature
      });

      return JSON.parse(completion.choices[0]?.message?.content || "[]");
    } catch (e) {
      console.error("Error in topics:", e);
      return [];
    }
  }

  public async image(text: string): Promise<string[]> {
    try {
      const params: OpenAI.Images.ImageGenerateParams = {
        model: "dall-e-3",
        prompt: text,
        n: 1,
        size: "1024x1024",
      };
  
      const image = await this.openai.images.generate(params);
      console.log(image.data[0].url);
      return JSON.parse(image.data[0].url || "[]");
    } catch (e) {
      console.error("Error in image generation:", e);
      return [];
    }
  }
}
