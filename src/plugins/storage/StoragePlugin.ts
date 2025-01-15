// src/plugins/storage/StoragePlugin.ts

import { Article } from "../../types";

export interface StoragePlugin {
  /**
   * Save a batch of articles to the storage destination (database, file system, etc.).
   */
  save(articles: Article[]): Promise<void>;
}