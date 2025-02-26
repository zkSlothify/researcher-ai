import axios from "axios";

export interface Tweet {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  author_id?: string;
}

export class TwitterService {
  private apiKey: string;
  private useMockData: boolean;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Use mock data if the API key is the placeholder value
    this.useMockData = apiKey === "your_twitter_api_key_here";
    
    if (this.useMockData) {
      console.log("Using mock Twitter data (no valid API key provided)");
    }
  }

  async searchTweets(query: string, maxResults: number = 10): Promise<Tweet[]> {
    if (this.useMockData) {
      return this.getMockTweets(query, maxResults);
    }
    
    try {
      const response = await axios.get("https://api.twitter.com/2/tweets/search/recent", {
        params: {
          query,
          max_results: maxResults,
          "tweet.fields": "created_at,public_metrics,author_id",
        },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching tweets:", error);
      throw error;
    }
  }

  private getMockTweets(query: string, maxResults: number): Tweet[] {
    const now = new Date();
    const mockTweets: Tweet[] = [
      {
        id: "mock_tweet_1",
        text: `Latest #AI news: OpenAI announces GPT-5 with improved reasoning capabilities. #${query.replace(" ", "")}`,
        created_at: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        public_metrics: {
          retweet_count: 1200,
          reply_count: 450,
          like_count: 3800,
          quote_count: 320
        },
        author_id: "12345"
      },
      {
        id: "mock_tweet_2",
        text: `Google DeepMind's new research shows promising results in multimodal learning. #AI #MachineLearning #${query.replace(" ", "")}`,
        created_at: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
        public_metrics: {
          retweet_count: 980,
          reply_count: 230,
          like_count: 2700,
          quote_count: 180
        },
        author_id: "23456"
      },
      {
        id: "mock_tweet_3",
        text: `Meta releases new open-source LLM with 100B parameters. Researchers claim it outperforms previous models on benchmark tests. #${query.replace(" ", "")}`,
        created_at: new Date(now.getTime() - 10800000).toISOString(), // 3 hours ago
        public_metrics: {
          retweet_count: 1500,
          reply_count: 620,
          like_count: 4200,
          quote_count: 410
        },
        author_id: "34567"
      },
      {
        id: "mock_tweet_4",
        text: `New study raises concerns about AI bias in healthcare applications. Researchers call for more diverse training data. #AIEthics #${query.replace(" ", "")}`,
        created_at: new Date(now.getTime() - 14400000).toISOString(), // 4 hours ago
        public_metrics: {
          retweet_count: 2100,
          reply_count: 890,
          like_count: 5600,
          quote_count: 730
        },
        author_id: "45678"
      },
      {
        id: "mock_tweet_5",
        text: `Anthropic introduces Claude 3, focusing on safety and alignment. #AI #LLM #${query.replace(" ", "")}`,
        created_at: new Date(now.getTime() - 18000000).toISOString(), // 5 hours ago
        public_metrics: {
          retweet_count: 1800,
          reply_count: 720,
          like_count: 4900,
          quote_count: 560
        },
        author_id: "56789"
      }
    ];
    
    // Return a subset of mock tweets based on maxResults
    return mockTweets.slice(0, Math.min(maxResults, mockTweets.length));
  }
}
