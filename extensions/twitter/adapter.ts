import { ContentSource } from "@core/plugins/sources/ContentSource";
import { ContentItem } from "@core/types";
import { TwitterService, Tweet } from "./service";

export class TwitterContentSource implements ContentSource {
  public readonly name: string;
  
  constructor(
    private twitterService: TwitterService,
    private searchQuery: string,
    private maxResults: number = 10
  ) {
    this.name = `twitter-${searchQuery}`;
  }
  
  async fetchItems(): Promise<ContentItem[]> {
    const tweets = await this.twitterService.searchTweets(this.searchQuery, this.maxResults);
    
    return tweets.map(tweet => ({
      cid: `twitter-${tweet.id}`,
      title: tweet.text.substring(0, 50) + (tweet.text.length > 50 ? '...' : ''),
      content: tweet.text,
      source: 'Twitter',
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      timestamp: tweet.created_at ? new Date(tweet.created_at) : new Date(),
      type: 'tweet'
    }));
  }
}
