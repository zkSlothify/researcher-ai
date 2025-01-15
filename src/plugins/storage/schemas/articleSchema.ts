// src/plugins/storage/articleSchema.ts

/**
 * A simple schema definition that corresponds to the Article interface fields.
 * The key is the column name, and the value is the column's SQLite type.
 */
export const articleSchema: Record<string, string> = {
    source: "TEXT",
    title: "TEXT",
    link: "TEXT",
    date: "TEXT",
    content: "TEXT",
    description: "TEXT",
    topics: "TEXT",
    author: "TEXT",
    imageUrl: "TEXT",
    tags: "TEXT"
  };