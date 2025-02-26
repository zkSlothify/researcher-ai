import { ContentAggregator } from "@core/aggregator/ContentAggregator";
import { StoragePlugin } from "@core/plugins/storage/StoragePlugin";
import { ContentItem, SummaryItem } from "@core/types";
import { TwitterContentSource } from "../extensions/twitter/adapter";
import { TwitterService } from "../extensions/twitter/service";
import { SocialDataContentSource, SocialDataUserContentSource } from "../extensions/socialdata/adapter";
import { SocialDataService } from "../extensions/socialdata/service";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define config interface
interface AppConfig {
  twitter: {
    apiKey: string;
    searchQueries: string[];
    maxResults: number;
  };
  socialData: {
    apiKey: string;
    baseUrl: string;
    searchQueries: string[];
    usernames: string[];
    maxResults: number;
  };
  storage: {
    type: string;
    path: string;
    name: string;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  twitter: {
    apiKey: 'your_twitter_api_key_here',
    searchQueries: ['AI news', 'artificial intelligence', 'machine learning'],
    maxResults: 10
  },
  socialData: {
    apiKey: 'your_socialdata_api_key_here',
    baseUrl: 'https://api.socialdata.tools',
    searchQueries: ['AI news', 'artificial intelligence', 'machine learning'],
    usernames: ['OpenAI', 'DeepMind', 'AnthropicAI'],
    maxResults: 10
  },
  storage: {
    type: 'sqlite',
    path: './data',
    name: 'content'
  }
};

// Load configuration
function loadConfig(): AppConfig {
  let userConfig: Partial<AppConfig> = {};
  
  // Try to load user configuration from config.json
  const configPath = path.join(process.cwd(), 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const configFile = fs.readFileSync(configPath, 'utf8');
      userConfig = JSON.parse(configFile);
    } catch (error) {
      console.warn('Error loading config.json:', error);
    }
  }
  
  // Merge default config with user config
  const mergedConfig = {
    ...defaultConfig,
    ...userConfig,
    twitter: {
      ...defaultConfig.twitter,
      ...userConfig.twitter
    },
    socialData: {
      ...defaultConfig.socialData,
      ...userConfig.socialData
    },
    storage: {
      ...defaultConfig.storage,
      ...userConfig.storage
    }
  };
  
  // Override with environment variables if they exist
  if (process.env.TWITTER_API_KEY) {
    mergedConfig.twitter.apiKey = process.env.TWITTER_API_KEY;
  }
  
  if (process.env.SOCIALDATA_API_KEY) {
    mergedConfig.socialData.apiKey = process.env.SOCIALDATA_API_KEY;
  }
  
  return mergedConfig;
}

// Extend ContentAggregator with fetchAndStore method if it doesn't exist
class ExtendedContentAggregator extends ContentAggregator {
  async fetchAndStore(sourceName: string): Promise<void> {
    const items = await this.fetchSource(sourceName);
    await this.saveItems(items, sourceName);
  }
}

// Create a simple in-memory storage implementation
class InMemoryStorage implements StoragePlugin {
  private items: Map<string, ContentItem> = new Map();
  private summaries: SummaryItem[] = [];
  
  async init(): Promise<void> {
    console.log("Initializing in-memory storage");
  }
  
  async close(): Promise<void> {
    console.log("Closing in-memory storage");
  }
  
  async saveContentItems(items: ContentItem[]): Promise<ContentItem[]> {
    for (const item of items) {
      this.items.set(item.cid, item);
    }
    console.log(`Saved ${items.length} items to in-memory storage`);
    return items;
  }
  
  async getContentItem(cid: string): Promise<ContentItem | null> {
    return this.items.get(cid) || null;
  }
  
  // Custom method not in the StoragePlugin interface
  async getAllContentItems(): Promise<ContentItem[]> {
    return Array.from(this.items.values());
  }
  
  // Custom method not in the StoragePlugin interface
  async getContentItemsBySource(source: string): Promise<ContentItem[]> {
    return Array.from(this.items.values()).filter(item => item.source === source);
  }
  
  async saveSummaryItem(item: SummaryItem): Promise<void> {
    this.summaries.push(item);
    console.log(`Saved summary item: ${item.title}`);
  }
  
  async getSummaryBetweenEpoch(startEpoch: number, endEpoch: number, excludeType?: string): Promise<SummaryItem[]> {
    return this.summaries.filter(item => {
      const date = item.date || 0;
      const matchesTimeRange = date >= startEpoch && date <= endEpoch;
      const matchesType = !excludeType || item.type !== excludeType;
      return matchesTimeRange && matchesType;
    });
  }
}

// SQLite storage implementation (simplified for this example)
class SQLiteStorage implements StoragePlugin {
  private config: { name: string; path: string };
  private items: ContentItem[] = []; // In-memory cache for demo purposes
  
  constructor(config: { name: string; path: string }) {
    this.config = config;
  }
  
  async init(): Promise<void> {
    console.log(`Initializing SQLite storage at ${this.config.path}/${this.config.name}`);
  }
  
  async close(): Promise<void> {
    console.log("Closing SQLite storage");
  }
  
  async saveContentItems(items: ContentItem[]): Promise<ContentItem[]> {
    // For demo purposes, just store in memory
    this.items = [...this.items, ...items];
    console.log(`Saved ${items.length} items to SQLite storage`);
    return items;
  }
  
  async getContentItem(cid: string): Promise<ContentItem | null> {
    return this.items.find(item => item.cid === cid) || null;
  }
  
  // Custom method not in the StoragePlugin interface
  async getAllContentItems(): Promise<ContentItem[]> {
    return this.items;
  }
  
  // Custom method not in the StoragePlugin interface
  async getContentItemsBySource(source: string): Promise<ContentItem[]> {
    return this.items.filter(item => item.source === source);
  }
  
  async saveSummaryItem(item: SummaryItem): Promise<void> {
    console.log(`Saved summary item: ${item.title}`);
  }
  
  async getSummaryBetweenEpoch(startEpoch: number, endEpoch: number, excludeType?: string): Promise<SummaryItem[]> {
    return []; // Simplified implementation
  }
}

async function main() {
  // Load configuration
  const config = loadConfig();
  
  // Initialize services
  const twitterService = new TwitterService(config.twitter.apiKey);
  const socialDataService = new SocialDataService(
    config.socialData.apiKey,
    config.socialData.baseUrl
  );
  
  // Initialize storage
  let storage: StoragePlugin & { getAllContentItems(): Promise<ContentItem[]> };
  if (config.storage.type === 'sqlite') {
    storage = new SQLiteStorage({
      path: config.storage.path,
      name: config.storage.name
    });
  } else {
    console.log("Using in-memory storage");
    storage = new InMemoryStorage();
  }
  await storage.init();
  
  // Initialize the core system
  const aggregator = new ExtendedContentAggregator();
  
  // Register storage
  aggregator.registerStorage(storage);
  
  // Initialize and register sources based on configuration
  const sources: Array<TwitterContentSource | SocialDataContentSource | SocialDataUserContentSource> = [];
  
  // 1. Twitter API (if API key is provided and not the placeholder)
  if (config.twitter.apiKey && config.twitter.apiKey !== 'your_twitter_api_key_here') {
    console.log("Initializing Twitter API source");
    const twitterSource = new TwitterContentSource(
      twitterService, 
      config.twitter.searchQueries[0], 
      config.twitter.maxResults
    );
    aggregator.registerSource(twitterSource);
    sources.push(twitterSource);
  }
  
  // 2. SocialData API (if API key is provided and not the placeholder)
  if (config.socialData.apiKey && config.socialData.apiKey !== 'your_socialdata_api_key_here') {
    console.log("Initializing SocialData API sources");
    
    // Register search query sources
    for (const query of config.socialData.searchQueries) {
      const socialDataSource = new SocialDataContentSource(
        socialDataService,
        query,
        config.socialData.maxResults
      );
      aggregator.registerSource(socialDataSource);
      sources.push(socialDataSource);
    }
    
    // Register user timeline sources
    for (const username of config.socialData.usernames) {
      const userSource = new SocialDataUserContentSource(
        socialDataService,
        username,
        config.socialData.maxResults
      );
      aggregator.registerSource(userSource);
      sources.push(userSource);
    }
  }
  
  // If no valid API keys are provided, use mock data with Twitter adapter
  if ((config.twitter.apiKey === 'your_twitter_api_key_here' || !config.twitter.apiKey) && 
      (config.socialData.apiKey === 'your_socialdata_api_key_here' || !config.socialData.apiKey)) {
    console.log("No valid API keys provided, using mock Twitter data");
    const twitterSource = new TwitterContentSource(
      twitterService, 
      config.twitter.searchQueries[0], 
      config.twitter.maxResults
    );
    aggregator.registerSource(twitterSource);
    sources.push(twitterSource);
  }
  
  // Fetch and store content from all registered sources
  try {
    if (sources.length === 0) {
      console.log("No sources registered. Please check your configuration.");
      await storage.close();
      return;
    }
    
    for (const source of sources) {
      console.log(`Fetching content from ${source.name}...`);
      await aggregator.fetchAndStore(source.name);
    }
    
    console.log("Content fetched and stored successfully");
    
    // Display the stored items
    const items = await storage.getAllContentItems();
    console.log(`Retrieved ${items.length} items from storage:`);
    items.forEach((item: ContentItem) => {
      console.log(`- ${item.title} (${item.source})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await storage.close();
  }
}

// Run the main function
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
