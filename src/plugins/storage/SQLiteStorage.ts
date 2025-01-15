// src/plugins/storage/SQLiteStorage.ts

import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import { Article } from "../../types";
import { StoragePlugin } from "./StoragePlugin";
import { articleSchema } from "./schemas/articleSchema";

type PragmaRow = { name: string };

export interface SQLiteStorageConfig {
  dbPath: string;
}


export class SQLiteStorage implements StoragePlugin {
  private db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  private dbPath: string;

  constructor(config: SQLiteStorageConfig) {
    this.dbPath = config.dbPath;
  }

  public async init(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database,
    });

    // Create table if it doesn’t exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT
        /* We'll add columns dynamically below */
      );
    `);

    // Run a method to auto-update columns
    await this.updateSchema();
  }

  /**
   * Compare existing columns in 'articles' with our articleSchema,
   * and add any missing columns automatically.
   */
  private async updateSchema(): Promise<void> {
    if (!this.db) return;

    // 1. Find existing columns in the 'articles' table
    const pragma = await this.db.all<PragmaRow[]>(`PRAGMA table_info(articles)`);
    const existingColumns = pragma.map(row => row.name);

    // 2. Compare with the articleSchema
    const schemaEntries = Object.entries(articleSchema); // e.g. [["source", "TEXT"], ["title", "TEXT"], ...]
    for (const [columnName, columnType] of schemaEntries) {
      // If the column doesn't exist, add it
      if (!existingColumns.includes(columnName)) {
        console.log(`Adding missing column '${columnName}' to 'articles' table.`);
        await this.db.run(`ALTER TABLE articles ADD COLUMN ${columnName} ${columnType};`);
      }
    }
  }

  public async save(articles: Article[]): Promise<void> {
    if (!this.db) {
      throw new Error("Database connection not initialized. Call init() first.");
    }

    // Build an insert statement dynamically using the keys from articleSchema
    const columnNames = Object.keys(articleSchema).join(", ");
    const placeholders = Object.keys(articleSchema).map(() => "?").join(", ");
    const insertSql = `
      INSERT INTO articles (${columnNames})
      VALUES (${placeholders})
    `;
    const insertStmt = await this.db.prepare(insertSql);

    try {
      await this.db.run("BEGIN TRANSACTION");
      for (const article of articles) {
        // Convert the Article object to an array of values matching the schema
        const values = this.mapArticleToValues(article);
        await insertStmt.run(values);
      }
      await this.db.run("COMMIT");
    } catch (error) {
      await this.db.run("ROLLBACK");
      throw error;
    } finally {
      await insertStmt.finalize();
    }
  }

  /**
   * Maps the article's fields to the array of values in schema order.
   */
  private mapArticleToValues(article: Article): unknown[] {
    return Object.keys(articleSchema).map(columnName => {
      switch (columnName) {
        case "date":
          // convert date to string if it exists
          return article.date ? article.date.toISOString() : null;

        case "topics":
          // topics array -> JSON string or comma-separated
          return article.topics ? article.topics.join(",") : null;

        case "tags":
          // tags array -> JSON string or comma-separated
          return article.tags ? article.tags.join(",") : null;

        default:
          // dynamically index the article object; might be undefined if not present
          // but that's okay for optional fields
          return (article as any)[columnName] ?? null;
      }
    });
  }
}