'use client';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth-store';
import useChatStore from "@/stores/chat-store";
import { useNotify } from "@/hooks/use-notify";
import { HTTP, HTTPMethod } from "@/utils/http";
import { UserType } from "@/types";

export const LS_KEY_JWT_TOKEN = 'jwt_token';

interface AuthContextType {
  token: string | null;
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface AuthState {
  logged_in: boolean;
  user_id: string | null;
  username?: string;
  email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, setAuth, resetAuth } = useAuthStore();
  const router = useRouter();
  const { clearChatStore } = useChatStore();
  const { notify } = useNotify();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const _token = localStorage.getItem(LS_KEY_JWT_TOKEN);
    setToken(_token);
  }, [])

  useEffect(() => {
    if (token) {
      try {
        const decoded: UserType = jwtDecode(token);
        setAuth({
          logged_in: true,
          user_id: decoded.user_id,
          username: decoded.username,
          email: decoded.email,
        });
      } catch (error) {
        console.error('Invalid token', error);
        resetAuth();
      }
    }
  }, [token, setAuth, resetAuth]);


  const loginApi = useApi(
    async (payload: { email: string; password: string }) => HTTP<{ token: string }>({
      method: HTTPMethod.Post,
      url: API_BASE_URL + '/login',
      payload,
    }),
    (res) => {
      const decoded: UserType = jwtDecode(res.token);
      setAuth({
        logged_in: true,
        user_id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
      });
      localStorage.setItem(LS_KEY_JWT_TOKEN, res.token);

      notify('Login successful.', 'Welcome back! Start Chatting!', 'success');
      router.push('/');
    },
    (err) => {
      notify('Login failed.', err.message, 'error');
    }
  );

  const registerApi = useApi(
    async (payload: { username: string, email: string; password: string }) => HTTP<{ token: string, username: string }>({
      method: HTTPMethod.Post,
      url: API_BASE_URL + '/register',
      payload,
    }),
    (res) => {
      const decoded: UserType = jwtDecode(res.token);
      setAuth({
        logged_in: true,
        user_id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
      });
      localStorage.setItem(LS_KEY_JWT_TOKEN, res.token);

      notify('Registration successful.', `Welcome, ${res.username}! Start Chatting!`, 'success');
      router.push('/');
    },
    (err) => {
      notify('Registration failed.', err.message, 'error');
    }
  );

  const login = async (email: string, password: string) => {
    loginApi.call({ email, password });
  };

  const register = async (username: string, email: string, password: string) => {
    registerApi.call({ username, email, password });
  };

  const logout = () => {
    console.log('logout')
    resetAuth();
    clearChatStore();
    localStorage.removeItem(LS_KEY_JWT_TOKEN);

    notify('Logged out.', 'You have been logged out.', 'success');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ token, auth, login, register, logout, loading: loginApi.loading() || registerApi.loading() }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
