import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/clients';

interface AuthContextType {
  token?: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const t = await loginApi(email, password);
    setToken(t);
  };

  const register = async (email: string, password: string) => {
    await registerApi(email, password);
    const t = await AsyncStorage.getItem('token');
    setToken(t);
  };

  const logout = async () => {
    await logoutApi();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
