export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

export interface TwitterAPIResponse {
  data: Tweet[];
  meta: {
    result_count: number;
    next_token?: string;
  };
}
