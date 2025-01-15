// src/plugins/DailySummaryGenerator.ts

import { OpenAIProvider } from "../ai/OpenAIProvider";
import { SQLiteStorage } from "../storage/SQLiteStorage";
import { ContentItem } from "../../types";
import crypto from "crypto";

interface DailySummaryGeneratorConfig {
  openAiProvider: OpenAIProvider;
  storage: SQLiteStorage;
  summaryType: string;
  source: string;
}

export class DailySummaryGenerator {
  private openAiProvider: OpenAIProvider;
  private storage: SQLiteStorage;
  private summaryType: string;
  private source: string;

  constructor(config: DailySummaryGeneratorConfig) {
    this.openAiProvider = config.openAiProvider;
    this.storage = config.storage;
    this.summaryType = config.summaryType;
    this.source = config.source;
  }

  
  public async generateAndStoreSummary(dateStr: string): Promise<void> {
    try {
        const endTime = new Date().getTime() / 1000;
        const startTime = endTime - ( 60 * 60 * 24);
      const contentItems: ContentItem[] = await this.storage.getContentItemsBetweenEpoch(startTime, endTime, this.summaryType);

      if (contentItems.length === 0) {
        console.warn(`No content found for date ${dateStr} to generate summary.`);
        return;
      }

      const groupedContent = this.groupContentByTopic(contentItems);

      const prompt = this.createAIPrompt(groupedContent, dateStr);

      const summaryText = await this.openAiProvider.summarize(prompt);

      console.log( summaryText )
    //   const summaryItem: ContentItem = {
    //     type: this.summaryType,
    //     source: this.source,
    //     cid: this.computeCid(dateStr),
    //     title: `Daily Summary for ${dateStr}`,
    //     text: summaryText,
    //     date: new Date(dateStr).getTime() / 1000,
    //     metadata: {
    //       generated_at: new Date().toISOString(),
    //     },
    //   };

    //   await this.storage.saveContentItem(summaryItem);

      console.log(`Daily summary for ${dateStr} generated and stored successfully.`);
    } catch (error) {
      console.error(`Error generating daily summary for ${dateStr}:`, error);
    }
  }

  
  private groupContentByTopic(items: ContentItem[]): Record<string, ContentItem[]> {
    const topicGroups: Record<string, ContentItem[]> = {};

    const uniqueTopics = new Set<string>();

    items.forEach(item => {
        try {
            let stringTopic : any = item?.topics;
          
            if ( stringTopic ) {
                let topics : any = JSON.parse(JSON.stringify(stringTopic))
                
                if (topics && topics.length > 0 && Array.isArray(topics) ) {
                    topics.forEach(topic => {
                        uniqueTopics.add(topic);
                    });
                }
            }
        }
        catch (e) {
            console.log(e)
        }
    });

    uniqueTopics.forEach(topic => {
      topicGroups[topic] = [];
    });

    topicGroups["Miscellaneous"] = [];

    items.forEach(item => {
      const itemTopics = item.topics;
      if (itemTopics && Array.isArray(itemTopics) && itemTopics.length > 0) {
        itemTopics.forEach(topic => {
          const trimmedTopic = topic.trim();
          if (topicGroups[trimmedTopic]) {
            topicGroups[trimmedTopic].push(item);
          } else {
            // If topic wasn't in uniqueTopics for some reason, assign to Miscellaneous
            topicGroups["Miscellaneous"].push(item);
          }
        });
      } else {
        // Assign to Miscellaneous if no topics are present
        topicGroups["Miscellaneous"].push(item);
      }
    });

    return topicGroups;
  }

  private createAIPrompt(groupedContent: Record<string, ContentItem[]>, dateStr: string): string {
    let prompt = `Generate a comprehensive daily newsletter for ${dateStr} based on the following topics and activities:\n\n`;

    for (const [topic, items] of Object.entries(groupedContent)) {
      prompt += `**${topic}:**\n`;
      items.forEach(item => {
        if (item.text) {
          prompt += `- ${item.text}\n`;
        }
      });
      prompt += `\n`;
    }

    prompt += `Provide a clear and concise summary that highlights the key activities and developments of the day.\n\n Make sure the outline talks about specific topics that were popular that day`;

    return prompt;
  }

  private computeCid(dateStr: string): string {
    const hash = crypto.createHash('sha256').update(dateStr).digest('hex').slice(0, 16);
    return `daily-summary-${hash}`;
  }
}