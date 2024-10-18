'use client';
import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useApi } from '@/hooks/use-api';
import { useAuth } from './auth-provider';
import useChatStore from '@/stores/chat-store';
import { ChatHistoryType } from '@/types';
import { useApiClient } from "./api-provider";

type ChatHistoryContextType = {
  chatHistories: ChatHistoryType[];
  fetchChatHistories: () => void;
  loading: boolean;
  refetch: () => void;
  error?: string;
};

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const ChatHistoryProvider = ({ children }: { children: ReactNode }) => {
  const { auth } = useAuth();
  const { chatHistories, setChatHistories } = useChatStore();
  const api = useApiClient();
  const userId = auth.user_id;

  const chatHistoryApi = useApi(
    api.chatHistory,
    (res) => {
      setChatHistories(res.history);
    }
  );

  const fetchChatHistories = async () => {
    if (!userId) return
    chatHistoryApi.call(userId!);
  };

  useEffect(() => {
    if (userId) {
      fetchChatHistories();
    }
  }, [userId]);

  const value = useMemo(() => ({
    chatHistories,
    fetchChatHistories,
    loading: chatHistoryApi.loading(),
    refetch: fetchChatHistories,
    error: chatHistoryApi.error(),
  }), [chatHistories,]);

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};
