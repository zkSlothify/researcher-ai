// src/plugins/sources/TwitterSource.ts

import { ContentSource } from "./ContentSource";
import { ContentItem } from "../../types";

// Hypothetical Twitter client
import { SearchMode, Scraper } from 'agent-twitter-client';

interface TwitterSourceConfig {
  name: string;
  username: string | undefined;
  password: string | undefined;
  email: string | undefined;
  accounts: string[];          // e.g., user to watch
}

export class TwitterSource implements ContentSource {
  public name: string;
  private client: Scraper;
  private accounts: string[];
  private username: string | undefined;
  private password: string | undefined;
  private email: string | undefined;

  constructor(config: TwitterSourceConfig) {
    this.name = config.name;
    this.client = new Scraper();
    this.accounts = config.accounts;
    this.username = config.username;
    this.password = config.password;
    this.email = config.email;
  }

  public async fetchItems(): Promise<ContentItem[]> {
    const isLoggedIn = await this.client.isLoggedIn();
    
    if ( ! isLoggedIn ) {
        if ( this.username && this.password && this.email ) {
            await this.client.login(this.username, this.password, this.email);
        }
    }

    let tweetsResponse : any[] = [];

    for (const account of this.accounts) {
        const tweets : AsyncGenerator<any> = await this.client.getTweets(account, 10);
        
        for await (const tweet of tweets) {
          let photos = tweet.photos.map((img : any) => img.url) || [];
          let retweetPhotos = tweet.retweetedStatus?.photos?.map((img : any) => img.url) || [];
          let videos = tweet.videos.map((img : any) => img.url) || [];
          let videoPreview = tweet.videos.map((img : any) => img.preview) || [];
          let retweetVideos = tweet.retweetedStatus?.videos.map((img : any) => img.url) || [];
          let retweetVideoPreview = tweet.retweetedStatus?.videos.map((img : any) => img.preview) || [];
          
            tweetsResponse.push({
                cid: tweet.id,
                type: "tweet",
                source: this.name,
                text: tweet.text,
                link: tweet.permanentUrl,
                date: tweet.timestamp,
                metadata: {
                    userId: tweet.userId,
                    tweetId: tweet.id,
                    likes: tweet.likes,
                    replies: tweet.replies,
                    retweets: tweet.retweets,
                    photos: photos.concat(retweetPhotos,videoPreview,retweetVideoPreview),
                    videos: videos.concat(retweetVideos)
                },
            })
        }
    }
    
    return tweetsResponse
  }
}