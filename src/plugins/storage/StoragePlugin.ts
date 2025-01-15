// src/plugins/storage/StoragePlugin.ts

import { ContentItem } from "../../types";

export interface StoragePlugin {
  init(): Promise<void>;
  save(items: ContentItem[]): Promise<ContentItem[]>;
}