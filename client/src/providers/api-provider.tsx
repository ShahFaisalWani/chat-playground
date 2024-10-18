import { createContext, useContext, ReactNode } from 'react';
import { useHttp } from '@/hooks/use-http';
import { LS_KEY_JWT_TOKEN, useAuth } from './auth-provider';
import { ResSendMessage } from "@/res";
import { ChatHistoryType, MessageType } from "@/types";
import { HttpError, HTTPMethod } from "@/utils/http";

interface ApiProviderProps {
  children: ReactNode;
}

const useApiProvider = () => {
  const { logout } = useAuth();
  const token = typeof window !== 'undefined' && localStorage.getItem(LS_KEY_JWT_TOKEN) || ''

  const httpClient = useHttp(
    process.env.NEXT_PUBLIC_API_URL!,
    () => token,
    undefined,
    (err: HttpError) => {
      if (err.status === 401) {
        logout();
      }
    },
  );

  const login = async (email: string, password: string) => {
    return httpClient.http<{ token: string }>({
      method: HTTPMethod.Post,
      path: '/login',
      payload: { email, password },
    });
  };

  const register = async (username: string, email: string, password: string) => {
    return httpClient.http<{ token: string }>({
      method: HTTPMethod.Post,
      path: '/register',
      payload: { username, email, password },
    });
  };

  const chatHistory = async (userId: string) => {
    return httpClient.http<{ history: ChatHistoryType[] }>({
      method: HTTPMethod.Get,
      path: `/chats?user_id=${userId}`,
    });
  };

  const getChatMessages = async (chatId: string) => {
    return httpClient.http<{ messages: MessageType[] }>({
      method: HTTPMethod.Get,
      path: `/chats/${chatId}/messages`,
    }
    );
  };

  const sendChatMessage = async (payload: Record<string, any>) => {
    return httpClient.http<ResSendMessage>({
      method: HTTPMethod.Post,
      path: '/chats',
      payload,
    });
  };

  const streamChat = async (
    chatId: string,
    signal: AbortSignal,
    onMessage: (message: any) => void,
    onComplete?: () => void,
    onError?: (err: any) => void
  ) => {
    return httpClient.httpStream({
      method: HTTPMethod.Get,
      path: `/chats/stream?chat_id=${chatId}`,
      signal,
    },
      onMessage,
      onComplete,
      onError
    );
  };

  const deleteChat = async (_chatId: string) => {
    return httpClient.http<void>({
      method: HTTPMethod.Post,
      path: '/chats/delete',
      payload: { chat_id: _chatId },
    });
  };

  const voteMessage = async (payload: Record<string, any>) => {
    return httpClient.http<void>({
      method: HTTPMethod.Post,
      path: '/chats/vote',
      payload,
    });
  };

  return {
    login,
    register,
    chatHistory,
    getChatMessages,
    sendChatMessage,
    streamChat,
    deleteChat,
    voteMessage,
  };
};

export const ApiContext = createContext<ReturnType<typeof useApiProvider> | null>(null);

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const apiProvider = useApiProvider();

  return (
    <ApiContext.Provider value={apiProvider}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiClient = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }
  return context;
};
