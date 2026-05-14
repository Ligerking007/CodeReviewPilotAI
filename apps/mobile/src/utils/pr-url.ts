export function isValidPullRequestUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const [owner, repo, pull, number] = url.pathname.split('/').filter(Boolean);
    return url.hostname === 'github.com' && Boolean(owner && repo && pull === 'pull' && Number(number) > 0);
  } catch {
    return false;
  }
}
