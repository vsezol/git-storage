import { execGitCommand } from './exec';

export async function commitFile(
  localRepoPath: string,
  filePath: string,
  commitMessage: string
): Promise<boolean> {
  try {
    await execGitCommand(`git add "${filePath}"`, localRepoPath);

    const status = await execGitCommand(
      'git status --porcelain',
      localRepoPath
    );
    const hasChanges = status.trim() !== '';

    if (hasChanges) {
      await execGitCommand(`git commit -m "${commitMessage}"`, localRepoPath);
      return true;
    }

    return false;
  } catch (error: any) {
    throw new Error(`Failed to add and commit: ${error.message}`);
  }
}
