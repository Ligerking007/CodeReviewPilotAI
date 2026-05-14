import * as Linking from 'expo-linking';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { githubLoginUrl } from '../services/api';
import { clearToken, getToken, saveToken } from '../services/storage';

type AuthContextValue = {
  token: string | null;
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
