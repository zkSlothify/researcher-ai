import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define config interface
export interface AppConfig {
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
export function loadConfig(): AppConfig {
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
