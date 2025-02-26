import { ContentSource } from "@core/plugins/sources/ContentSource";
import { ContentItem } from "@core/types";
import { SocialDataService, Tweet } from "./service";

export class SocialDataContentSource implements ContentSource {
  public readonly name: string;
  
  constructor(
    private socialDataService: SocialDataService,
    private searchQuery: string,
    private maxResults: number = 10
  ) {
    this.name = `socialdata-${searchQuery}`;
  }
  
  async fetchItems(): Promise<ContentItem[]> {
    const tweets = await this.socialDataService.searchTweets(this.searchQuery, this.maxResults);
    
    return tweets.map(tweet => ({
      cid: `twitter-${tweet.id}`,
      title: tweet.text.substring(0, 50) + (tweet.text.length > 50 ? '...' : ''),
      content: tweet.text,
      source: 'Twitter via SocialData',
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      timestamp: tweet.created_at ? new Date(tweet.created_at) : new Date(),
      type: 'tweet'
    }));
  }
}

export class SocialDataUserContentSource implements ContentSource {
  public readonly name: string;
  
  constructor(
    private socialDataService: SocialDataService,
    private username: string,
    private maxResults: number = 10
  ) {
    this.name = `socialdata-user-${username}`;
  }
  
  async fetchItems(): Promise<ContentItem[]> {
    const tweets = await this.socialDataService.getUserTweets(this.username, this.maxResults);
    
    return tweets.map(tweet => ({
      cid: `twitter-${tweet.id}`,
      title: tweet.text.substring(0, 50) + (tweet.text.length > 50 ? '...' : ''),
      content: tweet.text,
      source: `Twitter (${this.username}) via SocialData`,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      timestamp: tweet.created_at ? new Date(tweet.created_at) : new Date(),
      type: 'tweet'
    }));
  }
} 