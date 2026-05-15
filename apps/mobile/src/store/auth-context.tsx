import * as Linking from 'expo-linking';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { githubLoginUrl } from '../services/api';
import { clearToken, getToken, saveToken } from '../services/storage';

type AuthContextValue = {
  token: string | null;
  githubUsername: string | null;
  tokenLoaded: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setSessionToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

function getGithubUsernameFromToken(token: string | null) {
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

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    getToken()
      .then(setToken)
      .finally(() => setTokenLoaded(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      githubUsername: getGithubUsernameFromToken(token),
      tokenLoaded,
      async login() {
        await Linking.openURL(githubLoginUrl());
      },
      async logout() {
        await clearToken();
        setToken(null);
      },
      async setSessionToken(nextToken: string) {
        await saveToken(nextToken);
        setToken(nextToken);
      }
    }),
    [token, tokenLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
