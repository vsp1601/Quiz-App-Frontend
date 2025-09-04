import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as loginApi, register as registerApi, logout as logoutApi } from "../api/clients";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = "token";

const AuthContext = createContext<AuthContextType>({
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(TOKEN_KEY);
        setToken(saved);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistToken = async (t: string | null) => {
    setToken(t);
    if (t) {
      await AsyncStorage.setItem(TOKEN_KEY, t);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  };

  const login = async (email: string, password: string) => {
    const t = await loginApi(email, password); // must return token
    await persistToken(t);
  };

  const register = async (email: string, password: string) => {
    // Prefer API returning a token on register
    const maybeToken = await registerApi(email, password);
    if (typeof maybeToken === "string" && maybeToken.length > 0) {
      await persistToken(maybeToken);
      return;
    }
    // If not, fallback to login after register
    const t = await loginApi(email, password);
    await persistToken(t);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      await persistToken(null); // flips to Login stack via Gate
    }
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
