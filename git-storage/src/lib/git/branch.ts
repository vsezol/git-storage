import { execGitCommand } from './exec';

export async function ensureBranch(
  localRepoPath: string,
  branch: string
): Promise<void> {
  try {
    const branches = await execGitCommand('git branch -a', localRepoPath);

    const branchExists = branches.includes(branch);
    const remoteBranchExists = branches.includes(`remotes/origin/${branch}`);

    if (branchExists) {
      await execGitCommand(`git checkout ${branch}`, localRepoPath);
    } else if (remoteBranchExists) {
      await execGitCommand(
        `git checkout -b ${branch} origin/${branch}`,
        localRepoPath
      );
    } else {
      await execGitCommand(`git checkout -b ${branch}`, localRepoPath);
    }
  } catch (error: any) {
    throw new Error(`Branch operations failed: ${error.message}`);
  }
}
