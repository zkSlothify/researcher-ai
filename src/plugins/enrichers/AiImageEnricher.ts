// src/plugins/enrichers/AiTopicEnricher.ts

import { EnricherPlugin, ContentItem, AiEnricherConfig, AiProvider } from "../../types";

export class AiImageEnricher implements EnricherPlugin {
  private provider: AiProvider;
  private maxTokens?: number;
  private thresholdLength?: number;

  constructor(config: AiEnricherConfig) {
    this.provider = config.provider;
    this.maxTokens = config.maxTokens;
  }

  public async enrich(contentItems: ContentItem[]): Promise<ContentItem[]> {
    const enrichedContent: ContentItem[] = [];
    const thresholdLength = this.thresholdLength || 300;

    for (const contentItem of contentItems) {
      let images = contentItem?.metadata?.images || [];

      if (!contentItem || !contentItem.text || images.length > 0) {
        enrichedContent.push(contentItem);
        continue;
      }

      if (contentItem.text.length < thresholdLength) {
        enrichedContent.push(contentItem);
        continue;
      }

      try {
        const image = await this.provider.image(contentItem.text);
        
        enrichedContent.push({
          ...contentItem,
          metadata: {
            ...contentItem.metadata,
            images: image,
          }
        });
      } catch (error) {
        console.error("Error creating topics: ", error);
        enrichedContent.push(contentItem);
      }
    }

    return enrichedContent;
  }
}