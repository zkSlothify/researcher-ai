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

dotenv.config();

(async () => {
  // Initialize an AI Provider (OpenAI)
  const openAiProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: "gpt-3.5-turbo",
    temperature: 0,
  });

  // 1. Create aggregator
  const aggregator = new ContentAggregator();

  // 2. Register multiple sources
  aggregator.registerSource(new TwitterSource({
    name: "twitter",
    username: process.env.TWITTER_USERNAME,
    password: process.env.TWITTER_PASSWORD,
    email: process.env.TWITTER_EMAIL,
    accounts: ["daosdotfun", "ai16zdao", "shawmakesmagic"]
  }));

  aggregator.registerSource(new DiscordChannelSource({
    name: "discordChannel",
    botToken: process.env.DISCORD_TOKEN || '',
    channelIds: ["940835354846572594"],
    provider: openAiProvider,
  }));
  
  aggregator.registerSource(new DiscordAnnouncementSource({
    name: "discordAnnouncement",
    botToken: process.env.DISCORD_TOKEN || '',
    channelIds: ["940833937838714913"]
  }));

  aggregator.registerSource(
    new GitHubDataSource({
      name: "eliza_github",
      contributorsUrl: "https://raw.githubusercontent.com/elizaOS/elizaos.github.io/refs/heads/main/data/daily/contributors.json",
      summaryUrl: "https://raw.githubusercontent.com/elizaOS/elizaos.github.io/refs/heads/main/data/daily/summary.json",
      githubCompany: "elizaOS",
      githubRepo: "elizaos"
    })
  );

  aggregator.registerSource(
    new SolanaTokenAnalyticsSource({
      name: "solana_token_analytics",
      apiKey: process.env.BIRDEYE_API_KEY || '',
      tokenAddresses: ['HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC']
    })
  );

  aggregator.registerSource(
    new CoinGeckoMarketAnalyticsSource({
      name: "coin_gecko_token_analytics",
      tokenSymbols: ['bitcoin', 'ethereum', 'solana']
    })
  );

  aggregator.registerEnricher(
    new AiTopicsEnricher({
      provider: openAiProvider,
      thresholdLength: 30
    })
  );

  // 3. Fetch items from all sources
  const items = await aggregator.fetchAll();
  
  // 4. Store them in a unified storage
  const storage = new SQLiteStorage({ dbPath: "data/db.sqlite" });
  await storage.init();
  await storage.save(items);

  console.log("Fetched and stored items in a unified manner!");
})();