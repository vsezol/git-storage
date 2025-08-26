export function escapeRepoName(repoUrl: string): string {
  return repoUrl
    .replaceAll('https://', '')
    .replaceAll('http://', '')
    .replaceAll('/', '-')
    .replaceAll(':', '-')
    .replaceAll('@', '-')
    .replaceAll('.', '-');
}
