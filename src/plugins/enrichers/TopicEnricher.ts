// src/plugins/enrichers/TopicEnricher.ts

import { EnricherPlugin, Article } from "../../types";

export interface TopicConfig {
  topic: string;
  keywords: string[];
}

export class TopicEnricher implements EnricherPlugin {
  private topics: TopicConfig[];

  /**
   * @param topics - Array of topics with corresponding keywords
   * e.g. [{ topic: "sports", keywords: ["football", "soccer"] }, ...]
   */
  constructor(topics: TopicConfig[]) {
    this.topics = topics;
  }

  public enrich(articles: Article[]): Article[] {
    return articles.map(article => {
      const text = `${article.title} ${article.description} ${article.content}`.toLowerCase();
      const matchedTopics: string[] = [];

      for (const { topic, keywords } of this.topics) {
        for (const keyword of keywords) {
          if (text.includes(keyword.toLowerCase())) {
            matchedTopics.push(topic);
            break; // Avoid duplicates, move on to the next topic
          }
        }
      }

      return {
        ...article,
        topics: matchedTopics,
      };
    });
  }
}