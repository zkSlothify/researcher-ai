// src/plugins/DailySummaryGenerator.ts

import { OpenAIProvider } from "../ai/OpenAIProvider";
import { SQLiteStorage } from "../storage/SQLiteStorage";
import { ContentItem } from "../../types";
import fs from "fs";


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

      const groupedContent = this.groupObjectsByTopics(contentItems);

      const prompt = this.createAIPrompt(groupedContent, dateStr);

      const summaryText = await this.openAiProvider.summarize(prompt);
      const summaryJSONString = summaryText.replace(/```json\n|```/g, "");
      const summaryJSON = JSON.parse(summaryJSONString);
      const summaryItem: any = {
        type: this.summaryType,
        title: `Daily Summary for ${dateStr}`,
        text: JSON.stringify(summaryJSON || summaryText),
        date: new Date(dateStr).getTime() / 1000,
      };

      await this.storage.saveContentItem(summaryItem);

      fs.writeFileSync(`./json/${dateStr}.json`, JSON.stringify({
        type: this.summaryType,
        title: `Daily Summary for ${dateStr}`,
        text: summaryJSON,
        date: new Date(dateStr).getTime() / 1000,
      }, null, 2));

      console.log(`Daily summary for ${dateStr} generated and stored successfully.`);
    } catch (error) {
      console.error(`Error generating daily summary for ${dateStr}:`, error);
    }
  }

  private groupObjectsByTopics(objects : any[]): any[] {
    const topicMap = new Map();

    objects.forEach(obj => {
      if (obj.topics) {
        obj.topics.forEach((topic:any) => {
          let shortCase = topic.toLowerCase();
          if (!topicMap.has(shortCase)) {
            topicMap.set(shortCase, []);
          }
          topicMap.get(shortCase).push(obj);
        });
      }
    });

    const sortedTopics = Array.from(topicMap.entries()).sort((a, b) => b[1].length - a[1].length);
    const alreadyAdded : any = {}

    return sortedTopics.map(([topic, associatedObjects]) => {
      const mergedTopics = new Set();
      let topicAlreadyAdded = false;
      associatedObjects.forEach((obj:any) => {
        obj.topics.forEach((t:any) => {
          let lower = t.toLowerCase();

          if (alreadyAdded[lower]) {
            topicAlreadyAdded = true;
          }
          else {
            mergedTopics.add(lower)
          }
        });
      });
    
      if ( ! topicAlreadyAdded ) {
        alreadyAdded[topic] = true;

        return {
          topic,
          objects: associatedObjects,
          allTopics: Array.from(mergedTopics)
        };
      }
    });
  }

  private createAIPrompt(groupedContent: Record<string, any>[], dateStr: string): string {
    let prompt = `Generate a comprehensive daily newsletter for ${dateStr} based on the following topics. Make sure to combine topics that are related, and OUTLINE on these Topics ( News, Dev, Events, Market Conditions ). The newsletter must be a bulleted list for the popular topics with bullet points of the content under that topic. For Market Conditions BE SPECIFIC and summarize daily changes\n\n`;

    for (const [topic, items] of Object.entries(groupedContent)) {
      if (items && items.objects && items.objects.length > 0) {
        prompt += `**${topic}:**\n`;
        items.objects.forEach((item:any) => {
          if ( (item.metadata?.photos || []).length > 0 || (item.metadata?.videos || []).length > 0 || item.type === 'solanaTokenAnalytics' || item.type === 'coinGeckoMarketAnalytics') {
            prompt += `***item***\n`
            if (item.text) {
              prompt += `text: ${item.text}\n`;
            }
            if (item.link) {
              prompt += `sources: ${item.link}\n`;
            }
            if (item.metadata?.photos) {
              prompt += `photos: ${item.metadata?.photos}\n`;
            }
            if (item.metadata?.videos) {
              prompt += `videos: ${item.metadata?.videos}\n`;
            }
            prompt += `***item_end***\n`
            prompt += `\n`;
          }
        });
        prompt += `**topic_end**`
        prompt += `\n\n`;
      }
    }

    prompt += `Provide a clear and concise summary that highlights the key activities and developments of the day.\n\n`;

    prompt += `Response MUST be a valid JSON array containing the values in a JSON block of topics formatted for markdown with this structure:\n\n\{\n  'value',\n  'value'\n\}\n\nYour response must include the JSON block. Each JSON block should include the title of the topic, and the message content. Each message content MUST be a list of json objct of "text","sources","images","videos". the sources for references (sources MUST only be under the source key, its okay if no sources under a topic), the images/videos for references (images/videos MUST only be under the source key), and the messages.`

    return prompt;
  }
}