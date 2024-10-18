import React, { createContext, useContext, useEffect, ReactNode, useRef } from 'react';
import { useChat } from "./chat-provider";
import { VoteType } from "@/enums";
import useChatStore from "@/stores/chat-store";
import { io } from 'socket.io-client';

const WebSocketContext = createContext(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { chatId } = useChat();
  const { updateVote, removeChat } = useChatStore();

  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    const ws = io(process.env.NEXT_PUBLIC_API_BASE_URL, { path: '/api/ws', transports: ['websocket'] });

    ws.on('connect', () => {
      console.log('Connected to ws');
    });

    ws.on('disconnect', () => {
      console.log('Disconnected from ws');
    });

    ws.on('vote_update', (data: { chat_id: string, message_id: string, vote: VoteType }) => {
      console.log('ws: vote_update')
      if (data.chat_id === chatIdRef.current) {
        updateVote(data.chat_id, data.message_id, data.vote);
      }
    });

    ws.on('chat_deleted', (data: { chat_id: string, }) => {
      console.log('ws: chat_deleted')
      removeChat(data.chat_id);
    });

    ws.on('error', (err) => {
      console.error('Socket.IO Error:', err);
    });

  }, [chatId, updateVote, removeChat]);

  return (
    <WebSocketContext.Provider value={null}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};