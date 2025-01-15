// src/aggregator/ContentAggregator.ts

import { ContentSource } from "../plugins/sources/ContentSource";
import { ContentItem, EnricherPlugin } from "../types";

export class ContentAggregator {
  private sources: ContentSource[] = [];
  private enrichers: EnricherPlugin[] = [];

  public registerSource(source: ContentSource) {
    this.sources.push(source);
  }
  
  public registerEnricher(enricher: EnricherPlugin): void {
    this.enrichers.push(enricher);
  }

  /**
   * Fetch items from all registered sources
   */
  public async fetchAll(): Promise<ContentItem[]> {
    let allItems: ContentItem[] = [];
    for (const source of this.sources) {
      try {
        const items = await source.fetchItems();
        allItems = allItems.concat(items);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    // Apply each enricher to the entire articles array
    for (const enricher of this.enrichers) {
        allItems = await enricher.enrich(allItems);
    }

    return allItems;
  }
}