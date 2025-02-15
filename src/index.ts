import { ContentAggregator } from "./aggregator/ContentAggregator";
import { SQLiteStorage } from "./plugins/storage/SQLiteStorage";
import { OpenAIProvider } from "./plugins/ai/OpenAIProvider";
import { AiTopicsEnricher } from "./plugins/enrichers/AiTopicEnricher";
import { DailySummaryGenerator } from "./plugins/generators/DailySummaryGenerator";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { SummaryItem } from "./types";
import { loadSourceModules, resolveParam } from "./helpers/configHelper";

dotenv.config();

type Interval = number;

interface SourceConfig {
  source: any;
  interval: Interval;
}

const hour = 60 * 60 * 1000;
let dailySummaryInterval;
let runOnce = process.env.RUN_ONCE === 'true';

(async () => {
  try {
    // Fetch overide args to get run specific source config
    const args = process.argv.slice(2);
    let sourceFile = "sources.json"
    args.forEach(arg => {
      if (arg.startsWith('--source=')) {
        sourceFile = arg.split('=')[1];
      }
    });

    const sourceClasses = await loadSourceModules();
    
    // Load the JSON configuration file
    const configPath = path.join(__dirname, "../config", sourceFile);
    const configFile = fs.readFileSync(configPath, "utf8");
    const configJSON = JSON.parse(configFile);
    
    const sourceConfigs: SourceConfig[] = configJSON.sources.map((src: any) => {
      const { type, name, interval, params } = src;
      const SourceClass = sourceClasses[type];
      if (!SourceClass) {
        throw new Error(`Unknown source type: ${type}`);
      }
      
      // Resolve each parameter value
      const resolvedParams = Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = typeof value === "string" ? resolveParam(value) : value;
        return acc;
      }, {} as Record<string, any>);
      
      const source = new SourceClass({ name, ...resolvedParams });
      return { source, interval };
    });
    
    const openAiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.USE_OPENROUTER === 'true' ? `openai/gpt-4o-mini` : `gpt-4o-mini`,
      temperature: 0.1,
      useOpenRouter: process.env.USE_OPENROUTER === 'true',
      siteUrl: process.env.SITE_URL,
      siteName: process.env.SITE_NAME
    });
    
    const summaryOpenAiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: "gpt-4o",
      temperature: 0,
    });
  
    const aggregator = new ContentAggregator();
  
    sourceConfigs.forEach((config) => aggregator.registerSource(config.source));
  
    // If any source depends on the AI provider, set it here
    sourceConfigs.forEach(({ source }) => {
      if ("provider" in source && !source.provider) {
        source.provider = openAiProvider;
      }
    });
  
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

        let summary: SummaryItem[] = await storage.getSummaryBetweenEpoch((today.getTime() - ( hour * 24 )) / 1000,today.getTime() / 1000);
        
        if ( summary && summary.length <= 0 ) {
          const summaryDate = new Date(today);
          summaryDate.setDate(summaryDate.getDate() - 1)
          
          const dateStr = summaryDate.toISOString().slice(0, 10);
          console.log(`Summarizing data from for daily report`);
        
          await summaryGenerator.generateAndStoreSummary(dateStr);
          
          console.log(`Daily report is complete`);
        }
        else {
          console.log('Summary already generated for today, validating file is correct');
          const summaryDate = new Date(today);
          summaryDate.setDate(summaryDate.getDate() - 1)
          
          const dateStr = summaryDate.toISOString().slice(0, 10);

          await summaryGenerator.checkIfFileMatchesDB(dateStr, summary[0]);
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
