// src/aggregator/NewsAggregator.ts

import { SourcePlugin, EnricherPlugin, Article } from "../types";

export class NewsAggregator {
  private sources: SourcePlugin[] = [];
  private enrichers: EnricherPlugin[] = [];

  /**
   * Register a new source plugin.
   * @param source - A source plugin instance (e.g., RssSource, ApiSource).
   */
  public registerSource(source: SourcePlugin): void {
    this.sources.push(source);
  }

  /**
   * Register a data enricher plugin (e.g., for topic classification).
   * @param enricher - An enricher plugin instance.
   */
  public registerEnricher(enricher: EnricherPlugin): void {
    this.enrichers.push(enricher);
  }

  /**
   * Fetch articles from all registered sources, then apply each enricher.
   * @returns A promise that resolves to an array of normalized articles.
   */
  public async fetchAll(): Promise<Article[]> {
    let allArticles: Article[] | Promise<Article[]> = [];

    for (const source of this.sources) {
      try {
        const articles = await source.fetchArticles();
        allArticles = allArticles.concat(articles);
      } catch (error) {
        console.error(`Error fetching from source ${source.name}:`, error);
      }
    }

    // Apply each enricher to the entire articles array
    for (const enricher of this.enrichers) {
      allArticles = await enricher.enrich(allArticles);
    }

    return allArticles;
  }
}