import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function cloneRepository(
  repoUrl: string,
  localRepoPath: string
): Promise<void> {
  try {
    const parentDir = path.dirname(localRepoPath);
    await fs.mkdir(parentDir, { recursive: true });

    await execAsync(`git clone "${repoUrl}" "${localRepoPath}"`);
  } catch (error: any) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}
