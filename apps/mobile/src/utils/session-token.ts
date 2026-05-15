function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of padded) {
    if (char === '=') {
      break;
    }

    const index = alphabet.indexOf(char);
    if (index === -1) {
      return '';
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

export function getGithubUsernameFromToken(token: string | null) {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1] ?? '')) as { githubUsername?: unknown };
    return typeof payload.githubUsername === 'string' ? payload.githubUsername : null;
  } catch {
    return null;
  }
}
