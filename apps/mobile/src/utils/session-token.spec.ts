import { getGithubUsernameFromToken } from './session-token';

function createUnsignedJwt(payload: object) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`;
}

describe('getGithubUsernameFromToken', () => {
  it('reads the GitHub username from the app JWT payload', () => {
    const token = createUnsignedJwt({ sub: 'user-id', githubUsername: 'JakapanK' });

    expect(getGithubUsernameFromToken(token)).toBe('JakapanK');
  });

  it('returns null when the token does not contain a string username', () => {
    expect(getGithubUsernameFromToken(createUnsignedJwt({ sub: 'user-id' }))).toBeNull();
    expect(getGithubUsernameFromToken(createUnsignedJwt({ githubUsername: 123 }))).toBeNull();
  });

  it('returns null for malformed tokens', () => {
    expect(getGithubUsernameFromToken(null)).toBeNull();
    expect(getGithubUsernameFromToken('not-a-jwt')).toBeNull();
  });
});
