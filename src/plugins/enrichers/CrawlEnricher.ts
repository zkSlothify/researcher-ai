// src/plugins/enrichers/CrawlEnricher.ts

import { EnricherPlugin, Article } from "../../types";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export class CrawlEnricher implements EnricherPlugin {
  // (same config as before, concurrency, etc.)

  public async enrich(articles: Article[]): Promise<Article[]> {
    const enrichedArticles: Article[] = [];
    for (const article of articles) {
      const enriched = await this.crawlArticle(article);
      enrichedArticles.push(enriched);
    }
    return enrichedArticles;
  }

  private async crawlArticle(article: Article): Promise<Article> {
    if (!article.link) return article;

    try {
      const response = await fetch(article.link);
      if (!response.ok) {
        console.error(`Failed to fetch ${article.link}, status: ${response.status}`);
        return article;
      }

      const html = await response.text();
      
      // Create a DOM for Readability to parse
      const dom = new JSDOM(html, { url: article.link });
      const reader = new Readability(dom.window.document);
      const parsed = reader.parse();

      // parsed = { title: "...", byline: "...", content: "...", textContent: "...", ... } or null
      if (!parsed) {
        // If Readability couldn't parse, fall back to existing content
        return article;
      }

      // If you want the plain text, you can use parsed.textContent
      // If you want HTML, you can use parsed.content
      // Also parsed.byline might contain the author, parsed.title might override your existing title, etc.

      const enrichedArticle: Article = {
        ...article,
        title: parsed.title || article.title,
        author: parsed.byline || article.author,
        // Overwrite 'content' with the main readable text
        content: parsed.textContent || article.content,
      };

      return enrichedArticle;
    } catch (error) {
      console.error(`Error crawling article link ${article.link}:`, error);
      return article;
    }
  }
}