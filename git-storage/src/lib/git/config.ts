import { execGitCommand } from './exec';

export async function setGitConfig(
  key: string,
  value: string,
  localRepoPath: string
): Promise<void> {
  try {
    await execGitCommand(
      `git config user.${key.split('.')[1]} "${value}"`,
      localRepoPath
    );
  } catch (error: any) {
    throw new Error(`Failed to set git config ${key}: ${error.message}`);
  }
}
