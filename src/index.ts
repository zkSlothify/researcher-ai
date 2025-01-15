// src/index.ts

import { NewsAggregator } from "./aggregator/NewsAggregator";
import { RssSource } from "./plugins/sources/RssSource";
import { ApiSource } from "./plugins/sources/ApiSource";
import { TopicEnricher } from "./plugins/enrichers/TopicEnricher";
import { CrawlEnricher } from "./plugins/enrichers/CrawlEnricher";
import { SQLiteStorage } from "./plugins/storage/SQLiteStorage";

(async () => {
  // 1. Instantiate the news aggregator
  const aggregator = new NewsAggregator();

  // 2. Register sources
  aggregator.registerSource(
    new RssSource({
      name: "BBC RSS",
      url: "http://feeds.bbci.co.uk/news/rss.xml",
    })
  );

  aggregator.registerSource(
    new ApiSource({
      name: "Sample News API",
      endpoint: "https://newsapi.org/v2/top-headlines?country=us",
      apiKey: "",
    })
  );

  // 3. Register enrichers
  aggregator.registerEnricher(
    new TopicEnricher([
      { topic: "sports", keywords: ["football", "soccer", "basketball", "nba"] },
      { topic: "technology", keywords: ["tech", "software", "AI", "artificial intelligence"] },
      { topic: "politics", keywords: ["senate", "congress", "election"] },
    ])
  );

  // CrawlEnricher: specify CSS selectors for further details
  aggregator.registerEnricher(
    new CrawlEnricher()
  );

  // 4. Initialize the SQLite storage
  const storage = new SQLiteStorage({
    dbPath: "data/database.sqlite",
  });
  await storage.init();

  try {
    // 5. Fetch all news
    const articles = await aggregator.fetchAll();

    // 6. Save to SQLite
    await storage.save(articles);

    console.log("Articles have been saved to SQLite!");
  } catch (error) {
    console.error("Error occurred while fetching or saving news:", error);
  }
})();