// src/plugins/sources/GitHubDataSource.ts

import { ContentSource } from "./ContentSource";  // Your unified interface
import { ContentItem } from "../../types";         // Your unified item interface
import fetch from "node-fetch";

interface GithubDataSourceConfig {
  name: string;                // e.g. "github-data"
  contributorsUrl: string;     // e.g. "https://elizaos.github.io/data/daily/contributors.json"
  summaryUrl: string;          // e.g. "https://elizaos.github.io/data/daily/summary.json"
}

/**
 * A plugin that fetches GitHub-like data (contributors + summary)
 * from the two specified JSON endpoints and returns ContentItems.
 */
export class GitHubDataSource implements ContentSource {
  public name: string;
  private contributorsUrl: string;
  private summaryUrl: string;

  constructor(config: GithubDataSourceConfig) {
    this.name = config.name;
    this.contributorsUrl = config.contributorsUrl;
    this.summaryUrl = config.summaryUrl;
  }

  /**
   * Fetch items from both JSON endpoints and unify them
   * into an array of ContentItem objects.
   */
  public async fetchItems(): Promise<ContentItem[]> {
    try {
      const contributorsResp = await fetch(this.contributorsUrl);
      if (!contributorsResp.ok) {
        console.error(`Failed to fetch contributors.json. Status: ${contributorsResp.status}`);
        return [];
      }
      const contributorsData = await contributorsResp.json();

      const summaryResp = await fetch(this.summaryUrl);
      if (!summaryResp.ok) {
        console.error(`Failed to fetch summary.json. Status: ${summaryResp.status}`);
        return [];
      }
      const summaryData : any = await summaryResp.json();

      const contributorsItems: any[] = (Array.isArray(contributorsData)
        ? contributorsData : [] ).map((c: any) => {
                let date;

                if ( c.activity?.code?.commits?.length > 0 ) {
                    date = new Date(c.activity?.code?.commits[0].created_at)
                }
                else if ( c.activity?.code?.pull_requests?.length > 0 ) {
                    date = new Date(c.activity?.code?.pull_requests[0].created_at)
                }
                
                if ( date ) {
                    const isoString = date.toISOString();
                    const formattedDate = isoString.slice(0, 10);
                    const cid = `github-contrib-${c.contributor}-${formattedDate}`;

                    const item : ContentItem = {
                        type: "githubContributor",
                        cid: cid,
                        source: this.name,
                        link: undefined,
                        text: c.summary,
                        date: new Date().getTime() / 1000,
                        metadata: {
                            contributor: c.contributor,
                            score: c.score,
                            avatar_url: c.avatar_url,
                            total_prs: c.activity?.code?.total_prs,
                            total_commits: c.activity?.code?.total_commits,
                            total_opened: c.activity?.issues?.total_opened,
                            total_comments: c.activity?.engagement?.total_comments,
                            total_reviews: c.activity?.engagement?.total_reviews,
                            photos: [c.avatar_url]
                        },
                    }

                    return item;
                }
                return
        });
      
      const cid = `github-contrib-${summaryData.title}`;

      const summaryItem: ContentItem = {
        type: "githubSummary",
        title: summaryData.title,
        cid: cid,
        source: this.name,
        text: summaryData.overview,
        date: new Date().getTime() / 1000,
        metadata: {
          metrics: summaryData.metrics,
          changes: summaryData.changes,
          areas: summaryData.areas,
          issues_summary: summaryData.issues_summary,
          top_contributors: summaryData.top_contributors,
          questions: summaryData.questions,
        },
      };

      return [...contributorsItems, summaryItem];
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      return [];
    }
  }
}