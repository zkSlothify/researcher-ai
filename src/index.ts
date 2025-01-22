import { ContentAggregator } from "./aggregator/ContentAggregator";
import { TwitterSource } from "./plugins/sources/TwitterSource";
import { GitHubDataSource } from "./plugins/sources/GitHubDataSource";
import { SQLiteStorage } from "./plugins/storage/SQLiteStorage";
import { OpenAIProvider } from "./plugins/ai/OpenAIProvider";
import { AiTopicsEnricher } from "./plugins/enrichers/AiTopicEnricher";
import { DiscordChannelSource } from "./plugins/sources/DiscordChannelSource";
import { DiscordAnnouncementSource } from "./plugins/sources/DiscordAnnouncementSource";
import { SolanaTokenAnalyticsSource } from "./plugins/sources/SolanaAnalyticsSource";
import { CoinGeckoMarketAnalyticsSource } from "./plugins/sources/CoinGeckoAnalyticsSource";

import dotenv from "dotenv";
import { DailySummaryGenerator } from "./plugins/generators/DailySummaryGenerator";

dotenv.config();

type Interval = number;

interface SourceConfig {
  source: any;
  interval: Interval;
}

let hour = 60 * 60 * 1000;

let dailySummaryInterval;

let runOnce = process.env.RUN_ONCE === 'true';

const sourceConfigs: SourceConfig[] = [
  {
    source: new TwitterSource({
      name: "twitter",
      username: process.env.TWITTER_USERNAME,
      password: process.env.TWITTER_PASSWORD,
      email: process.env.TWITTER_EMAIL,
      accounts: ["daosdotfun", "ai16zdao", "shawmakesmagic"]
    }),
    interval: 0.5 * hour // 30 minutes
  },
  {
    source: new DiscordChannelSource({
      name: "discordChannel",
      botToken: process.env.DISCORD_TOKEN || '',
      channelIds: ["940835354846572594"],
      provider: undefined,
    }),
    interval: 0.1 * hour // 6 minutes
  },
  {
    source: new DiscordAnnouncementSource({
      name: "discordAnnouncement",
      botToken: process.env.DISCORD_TOKEN || '',
      channelIds: ["940833937838714913"]
    }),
    interval: hour
  },
  {
    source: new GitHubDataSource({
      name: "eliza_github",
      contributorsUrl: "https://raw.githubusercontent.com/elizaOS/elizaos.github.io/refs/heads/main/data/daily/contributors.json",
      summaryUrl: "https://raw.githubusercontent.com/elizaOS/elizaos.github.io/refs/heads/main/data/daily/summary.json",
      githubCompany: "elizaOS",
      githubRepo: "elizaos"
    }),
    interval: 6 * hour // 6 hours
  },
  {
    source: new SolanaTokenAnalyticsSource({
      name: "solana_token_analytics",
      apiKey: process.env.BIRDEYE_API_KEY || '',
      tokenAddresses: ['HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC']
    }),
    interval: 12 * hour // 12 hours
  },
  {
    source: new CoinGeckoMarketAnalyticsSource({
      name: "coin_gecko_token_analytics",
      tokenSymbols: ['bitcoin', 'ethereum', 'solana']
    }),
    interval: 12 * hour // 12 hours
  }
];

(async () => {
  try {
    const openAiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: "gpt-3.5-turbo",
      temperature: 0,
    });
    
    const summaryOpenAiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: "gpt-4o",
      temperature: 0,
    });
  
    // 1. Create aggregator
    const aggregator = new ContentAggregator();
  
    sourceConfigs.forEach((config) => aggregator.registerSource(config.source));
  
    // If any source depends on the AI provider, set it here
    const discordChannelSource = sourceConfigs.find(
      (cfg) => cfg.source instanceof DiscordChannelSource
    )?.source as DiscordChannelSource | undefined;
  
    if (discordChannelSource) {
      discordChannelSource.provider = openAiProvider;
    }
  
    aggregator.registerEnricher(
      new AiTopicsEnricher({
        provider: openAiProvider,
        thresholdLength: 30
      })
    );
    
    const storage = new SQLiteStorage({ dbPath: "data/db.sqlite" });
    await storage.init();
  
    const summaryGenerator = new DailySummaryGenerator({
      openAiProvider: summaryOpenAiProvider,
      storage,
      summaryType: "dailySummary",
      source: "aiSummary",
    });

    const fetchAndStore = async (sourceName: string) => {
      try {
        console.log(`Fetching data from source: ${sourceName}`);
        const items = await aggregator.fetchSource(sourceName);
        if (items.length > 0) {
          await storage.save(items);
          console.log(`Stored ${items.length} items from source: ${sourceName}`);
        } else {
          console.log(`No new items fetched from source: ${sourceName}`);
        }
      } catch (error) {
        console.error(`Error fetching/storing data from source ${sourceName}:`, error);
      }
    };

    const summarizeDaily = async () => {
      try {
        const today = new Date();
        
        let summary = await storage.getSummaryBetweenEpoch((today.getTime() - ( hour * 24 * 1000)) / 1000,today.getTime() / 1000);
        
        if ( summary && summary.length <= 0 ) {
          const dateStr = today.toISOString().slice(0, 10);
          console.log(`Summarizing data from for daily report`);
        
          await summaryGenerator.generateAndStoreSummary(dateStr);
          
          console.log(`Daily report is complete`);
        }
        else {
          console.log('Summary already generated for today');
        }
      } catch (error) {
        console.error(`Error creating daily report:`, error);
      }
    };
  
    const shutdown = async () => {
      console.log("Shutting down...");
      await storage.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    sourceConfigs.forEach(async (config) => {
      fetchAndStore(config.source.name);

      setInterval(() => {
        fetchAndStore(config.source.name);
      }, config.interval);
    });
    
    if (runOnce) {
      await new Promise(resolve => setTimeout(resolve, 90000))
    }

    await summarizeDaily()
    dailySummaryInterval = setInterval(() => {
      summarizeDaily()
    }, hour * 1);

    console.log("Content aggregator is running and scheduled.");

    if (runOnce) {
      await shutdown();
      console.log("Content aggregator is complete.");
    }
  } catch (error) {
    clearInterval(dailySummaryInterval);
    console.error("Error initializing the content aggregator:", error);
    process.exit(1);
  }
})();