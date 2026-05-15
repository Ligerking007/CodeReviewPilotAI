import * as Linking from 'expo-linking';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { githubLoginUrl } from '../services/api';
import { clearToken, getToken, saveToken } from '../services/storage';
import { getGithubUsernameFromToken } from '../utils/session-token';

type AuthContextValue = {
  token: string | null;
  githubUsername: string | null;
  tokenLoaded: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setSessionToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
      // Display-only identity. Backend guards still verify the JWT on every protected request.
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
