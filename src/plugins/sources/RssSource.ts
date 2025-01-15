// src/plugins/sources/RssSource.ts

import { BaseSource } from "./BaseSource";
import { Article } from "../../types";
import RSSParser from "rss-parser";

interface RssSourceConfig {
  name: string;
  url: string;
}

export class RssSource extends BaseSource {
  private url: string;
  private parser: RSSParser;

  constructor({ name, url }: RssSourceConfig) {
    super(name);
    this.url = url;
    this.parser = new RSSParser();
  }

  public async fetchArticles(): Promise<Article[]> {
    console.log(`Fetching RSS feed from ${this.url}`);
    const feed = await this.parser.parseURL(this.url);

    const articles: Article[] = feed.items.map(item => ({
      source: this.name,
      title: item.title ?? "",
      link: item.link ?? "",
      date: item.pubDate ? new Date(item.pubDate) : null,
      content: item.content ?? "",
      description: item.contentSnippet ?? "",
    }));

    return articles;
  }
}