// src/plugins/storage/StoragePlugin.ts

import { ContentItem, SummaryItem } from "../../types";

export interface StoragePlugin {
  init(): Promise<void>;
  close(): Promise<void>;
  save(items: ContentItem[]): Promise<ContentItem[]>;
  saveContentItem(item: SummaryItem): Promise<void>;
  getSummaryBetweenEpoch(startEpoch: number,endEpoch: number,excludeType?: string): Promise<SummaryItem[]>;
}