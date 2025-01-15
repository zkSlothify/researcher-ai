// src/types.ts

/**
 * Represents a normalized article object in the system.
 */
export interface Article {
  source: string;
  title: string;
  link: string;
  date?: Date | null;
  content?: string;
  description?: string;
  topics?: string[];

  // New optional fields for crawler
  author?: string;
  imageUrl?: string;
  tags?: string[];
}
  
  /**
   * An interface that any source plugin must implement.
   */
  export interface SourcePlugin {
    name: string;
    fetchArticles(): Promise<Article[]>;
  }
  
  /**
   * An interface for any enricher plugin.
   * The enrich() method should transform or annotate a list of articles.
   */
  export interface EnricherPlugin {
    enrich(articles: Article[]): Article[] | Promise<Article[]>;
  }
