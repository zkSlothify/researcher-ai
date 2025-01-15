import { SQLiteStorage } from "./plugins/storage/SQLiteStorage";
import { OpenAIProvider } from "./plugins/ai/OpenAIProvider";
import { DailySummaryGenerator } from "./plugins/generators/DailySummaryGenerator";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const openAiProvider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: "gpt-4o",
    temperature: 0,
  });


  const storage = new SQLiteStorage({ dbPath: "data/db.sqlite" });
  await storage.init();

  const summaryGenerator = new DailySummaryGenerator({
    openAiProvider,
    storage,
    summaryType: "dailySummary",
    source: "aiSummary",
  });
  
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  await summaryGenerator.generateAndStoreSummary(dateStr);

  console.log("Fetched and stored items in a unified manner!");
})();