// src/plugins/sources/ApiSource.ts

import { BaseSource } from "./BaseSource";
import { Article } from "../../types";
import fetch from "node-fetch";

interface ApiSourceConfig {
  name: string;
  endpoint: string;
  apiKey: string;
}

interface ApiResponse {
  articles: Array<{
    title: string;
    url: string;
    publishedAt: string;
    content?: string;
    description?: string;
  }>;
}

export class ApiSource extends BaseSource {
  private endpoint: string;
  private apiKey: string;

  constructor({ name, endpoint, apiKey }: ApiSourceConfig) {
    super(name);
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  public async fetchArticles(): Promise<Article[]> {
    console.log(`Fetching data from API endpoint: ${this.endpoint}`);

    const url = `${this.endpoint}&apiKey=${this.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const jsonData = (await response.json()) as ApiResponse;
    
    const articles: Article[] = jsonData.articles.map(item => ({
      source: this.name,
      title: item.title,
      link: item.url,
      date: item.publishedAt ? new Date(item.publishedAt) : null,
      content: item.content,
      description: item.description,
    }));

    return articles;
  }
}