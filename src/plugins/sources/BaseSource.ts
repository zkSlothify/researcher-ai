// src/plugins/sources/BaseSource.ts

import { SourcePlugin, Article } from "../../types";

export abstract class BaseSource implements SourcePlugin {
  public name: string;

  constructor(name: string) {
    if (new.target === BaseSource) {
      throw new Error("BaseSource is an abstract class and cannot be instantiated directly.");
    }
    this.name = name;
  }

  public abstract fetchArticles(): Promise<Article[]>;
}