import { isGithubUsernameAllowed, parseGithubUsernameAllowlist } from './github-allowlist';

describe('github allowlist', () => {
  it('allows every GitHub username when the allowlist is empty', () => {
    expect(isGithubUsernameAllowed('octocat')).toBe(true);
    expect(isGithubUsernameAllowed('octocat', '')).toBe(true);
  });

  it('normalizes comma-separated usernames case-insensitively', () => {
    const allowlist = parseGithubUsernameAllowlist(' Ligerking007, JakapanK ');

    expect(allowlist.has('ligerking007')).toBe(true);
    expect(allowlist.has('jakapank')).toBe(true);
    expect(isGithubUsernameAllowed('JakapanK', 'ligerking007,jakapank')).toBe(true);
  });

  it('rejects usernames that are not in the allowlist', () => {
    expect(isGithubUsernameAllowed('octocat', 'ligerking007,jakapank')).toBe(false);
  });
});
