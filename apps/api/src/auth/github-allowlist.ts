export function parseGithubUsernameAllowlist(value?: string | null) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((username) => username.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isGithubUsernameAllowed(username: string, allowlistValue?: string | null) {
  const allowlist = parseGithubUsernameAllowlist(allowlistValue);

  if (allowlist.size === 0) {
    return true;
  }

  return allowlist.has(username.trim().toLowerCase());
}
