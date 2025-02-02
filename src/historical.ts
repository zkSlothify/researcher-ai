import { HistoricalAggregator } from "./aggregator/HistoricalAggregator";
import { TwitterSource } from "./plugins/sources/TwitterSource";
import { SQLiteStorage } from "./plugins/storage/SQLiteStorage";
import { OpenAIProvider } from "./plugins/ai/OpenAIProvider";
import { AiTopicsEnricher } from "./plugins/enrichers/AiTopicEnricher";

import dotenv from "dotenv";

dotenv.config();

let hour = 60 * 60 * 1000;
let day = 24 * hour;

let dailySummaryInterval;

let runOnce = process.env.RUN_ONCE === 'true';

(async () => {
  try {
    const aggregator = new HistoricalAggregator();
  
    const twitterSource = new TwitterSource({
        name: "twitter",
        username: process.env.TWITTER_USERNAME,
        password: process.env.TWITTER_PASSWORD,
        email: process.env.TWITTER_EMAIL,
        accounts: ["daosdotfun", "ai16zdao", "shawmakesmagic"]
    });

    const openAiProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: "gpt-3.5-turbo",
    temperature: 0,
    });

    aggregator.registerSource(twitterSource)
  
    aggregator.registerEnricher(
      new AiTopicsEnricher({
        provider: openAiProvider,
        thresholdLength: 30
      })
    );
    
    const storage = new SQLiteStorage({ dbPath: "data/db.sqlite" });
    await storage.init();

    const fetchAndStore = async (sourceName: string) => {
      let daysToFetch = 60;
      
      try {
        console.log(`Fetching historical data from source: ${sourceName}`);
        const items = await aggregator.fetchSource(sourceName, daysToFetch * day);
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

    await fetchAndStore("twitter");

  } catch (error) {
    clearInterval(dailySummaryInterval);
    console.error("Error initializing the content aggregator:", error);
    process.exit(1);
  }
})();