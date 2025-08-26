import { execGitCommand } from './exec';

export async function pullChanges(
  localRepoPath: string,
  branch: string
): Promise<void> {
  try {
    await execGitCommand(`git pull origin ${branch}`, localRepoPath);
  } catch (error: any) {
    throw new Error(`Pull failed: ${error.message}`);
  }
}

export async function pushChanges(
  localRepoPath: string,
  branch: string
): Promise<void> {
  try {
    const hasUnpushedCommits = await checkUnpushedCommits(
      localRepoPath,
      branch
    );

    if (hasUnpushedCommits) {
      await execGitCommand(`git push origin ${branch}`, localRepoPath);
    }
  } catch (error: any) {
    throw new Error(`Push failed: ${error.message}`);
  }
}

export async function checkUnpushedCommits(
  localRepoPath: string,
  branch: string
): Promise<boolean> {
  try {
    const result = await execGitCommand(
      `git rev-list --count origin/${branch}..HEAD`,
      localRepoPath
    );
    return parseInt(result) > 0;
  } catch {
    return true;
  }
}
