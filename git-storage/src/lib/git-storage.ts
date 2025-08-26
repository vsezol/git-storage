/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  cloneRepository,
  ensureBranch,
  setGitConfig,
  pullChanges,
  pushChanges,
  type GitAuthor,
  commitFile,
} from './git';
import { escapeRepoName, id } from './utils';
import { getFromFile, saveToFile } from './file';

export interface GitStorageOptions {
  repositoryUrl: string;
  branch?: string;
  fileName?: string;
  localPath?: string;
  author?: GitAuthor;
}

export class GitStorage<T extends Record<string, any>> {
  private data: Map<keyof T, T[keyof T]>;

  private readonly repoUrl: string;
  private readonly localRepoPath: string;
  private readonly filePath: string;

  private readonly fileName: string;
  private readonly branch: string;
  private readonly author?: GitAuthor;

  constructor(options: GitStorageOptions) {
    this.data = new Map<keyof T, T[keyof T]>();
    this.repoUrl = options.repositoryUrl;
    this.fileName = options.fileName || 'root';
    this.branch = options.branch || 'main';
    this.author = options.author;
    this.localRepoPath = options.localPath || this.getLocalRepoPath();
    this.filePath = this.getFilePath();
  }

  async init(): Promise<void> {
    try {
      const repoExists = await this.checkRepositoryExists();

      if (!repoExists) {
        await cloneRepository(this.repoUrl, this.localRepoPath);
      } else {
        await pullChanges(this.localRepoPath, this.branch);
      }

      if (this.author) {
        await setGitConfig('user.name', this.author.name, this.localRepoPath);
        await setGitConfig('user.email', this.author.email, this.localRepoPath);
      }

      await ensureBranch(this.localRepoPath, this.branch);

      await this.loadData();
    } catch (error) {
      throw new Error(`Failed to initialize GitStorage: ${error}`);
    }
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    const item = this.data.get(key);

    return item ? { ...item } : undefined;
  }

  async set<K extends keyof T>(
    key: K,
    data: T[K],
    commit: string = id()
  ): Promise<void> {
    this.data.set(key, data);

    await this.persistAndCommit(`set(${String(key)}): ${commit}`);
  }

  async patch<K extends keyof T>(
    key: K,
    data: T[K] extends (infer U)[] ? U[] : Partial<T[K]>,
    commit: string = id()
  ): Promise<void> {
    const existing = this.data.get(key);

    if (!existing) {
      throw new Error(
        `Key '${String(key)}' does not exist. Use set() to add new data.`
      );
    }

    if (Array.isArray(existing)) {
      this.data.set(key, [...existing, data] as T[K]);
    } else {
      this.data.set(key, { ...existing, ...data } as T[K]);
    }

    await this.persistAndCommit(`patch(${String(key)}): ${commit}`);
  }

  async delete<K extends keyof T>(
    key: K,
    commit: string = id()
  ): Promise<boolean> {
    const existed = this.data.has(key);

    if (!existed) {
      return false;
    }

    this.data.delete(key);
    await this.persistAndCommit(`delete(${String(key)}): ${commit}`);

    return true;
  }

  async clear(commit: string = id()): Promise<void> {
    this.data.clear();
    await this.persistAndCommit(`clear: ${commit}`);
  }

  async sync(): Promise<void> {
    await pullChanges(this.localRepoPath, this.branch);
    await this.loadData();
    await pushChanges(this.localRepoPath, this.branch);
  }

  private async checkRepositoryExists(): Promise<boolean> {
    try {
      await fs.access(path.join(this.localRepoPath, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  private async loadData(): Promise<void> {
    try {
      const data = await getFromFile<Record<string, T>>(this.filePath);
      this.data.clear();

      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          this.data.set(key as keyof T, value as T[keyof T]);
        });
      }
    } catch {
      this.data.clear();
      await saveToFile(this.filePath, {});
    }
  }

  private async persistAndCommit(commitMessage: string): Promise<void> {
    try {
      const dataObject: Record<string, T[keyof T]> = {};

      this.data.forEach((value, key) => {
        dataObject[String(key)] = value;
      });

      await saveToFile(this.filePath, dataObject);

      const hasChanges = await commitFile(
        this.localRepoPath,
        this.filePath,
        commitMessage
      );

      if (hasChanges) {
        await pushChanges(this.localRepoPath, this.branch);
      }
    } catch (error: any) {
      throw new Error(`Failed to persist and commit: ${error.message}`);
    }
  }

  private getFilePath(): string {
    return path.join(this.localRepoPath, `${this.fileName}.json`);
  }

  private getLocalRepoPath(): string {
    return path.join(__dirname, 'git-storage', escapeRepoName(this.repoUrl));
  }
}
