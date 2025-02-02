// src/aggregator/ContentAggregator.ts

import { ContentSource } from "../plugins/sources/ContentSource";
import { ContentItem, EnricherPlugin } from "../types";

export class HistoricalAggregator {
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
  public async fetchAll(days: number): Promise<ContentItem[]> {
    let allItems: ContentItem[] = [];
    for (const source of this.sources) {
      try {
        if ( source.fetchHistorical ) {
          const items = await source.fetchHistorical(days);
          allItems = allItems.concat(items);
        }
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

  /**
   * Fetch items from all registered sources
   */
  public async fetchSource(sourceName: string, days: number): Promise<ContentItem[]> {
    let allItems: ContentItem[] = [];
    for (const source of this.sources) {
      try {
        if ( source.name === sourceName ) {
          if ( source.fetchHistorical ) {
            const items = await source.fetchHistorical(days);
            console.log( items );
            allItems = allItems.concat(items);
          }
        }
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