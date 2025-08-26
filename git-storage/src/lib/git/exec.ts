import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function execGitCommand(
  command: string,
  localRepoPath: string
): Promise<string> {
  try {
    const { stdout } = await execAsync(command, {
      cwd: localRepoPath,
      encoding: 'utf8',
    });

    return stdout.trim();
  } catch (error: any) {
    throw new Error(`Git command failed: ${command}\nError: ${error.message}`);
  }
}
