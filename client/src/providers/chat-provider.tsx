import React, { createContext, useContext, useEffect, ReactNode, useCallback, useState } from 'react';
import useChatStore from '@/stores/chat-store';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { MessageType, ChatParameterType } from "@/types";
import { ChatRole, VoteType } from "@/enums";
import { useStream } from "@/hooks/use-stream";
import { useApi } from '@/hooks/use-api';
import { useAuth } from "./auth-provider";
import { useApiClient } from "./api-provider";

interface ChatContextType {
  chatId: string;
  messages: MessageType[];
  isStreaming: boolean;
  initLoading: boolean;
  chatLoading: boolean;
  parameters: ChatParameterType;
  setParameters: (newParameters: Partial<ChatParameterType>) => void;
  sendMessage: (userInput: string, messageId?: string, messageIndex?: number, onComplete?: (chatId: string) => void) => void;
  closeStream: () => void;
  handleVoteMessage: (chatId: string, messageId: string, vote: VoteType) => void;
  fetchChat: (chatId: string) => void;
  clear: () => void;
  handleDeleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ chatId: string }>();
  const { startStream, closeStream } = useStream();
  const { auth } = useAuth()
  const userId = auth.user_id
  const api = useApiClient();

  const [chatId, setChatId] = useState(params.chatId || '');
  useEffect(() => {
    setChatId(params.chatId || '');
  }, [params.chatId]);

  const [parameters, setParameters] = useState<ChatParameterType>({
    output_length: 150,
    temperature: 0.6,
    top_p: 0.7,
    repetition_penalty: 1.05,
    model: 'typhoon-v1.5x-70b-instruct',
  });

  const updateParameters = (newParameters: Partial<ChatParameterType>) => {
    setParameters((prev) => ({ ...prev, ...newParameters }));
  };

  const {
    chatMessages,
    setMessages,
    addMessage,
    updateMessageId,
    isStreaming,
    setIsStreaming,
    initLoading,
    setInitLoading,
  } = useChatStore();

  const getChatApi = useApi(api.getChatMessages);
  const chatApi = useApi(api.sendChatMessage);
  const deleteChatApi = useApi(api.deleteChat);
  const voteApi = useApi(api.voteMessage);

  const fetchChat = async (chatId: string) => {
    if (chatId === '' || chatMessages[chatId]?.length > 0) {
      return;
    }
    const res = await getChatApi.call(chatId);

    if (!res.error) {
      const existingMessages = chatMessages[chatId] || [];

      const newMessages = res.messages.filter(
        (fetchedMessage) => !existingMessages.some(
          (existingMessage) => existingMessage.message_id === fetchedMessage.message_id
        )
      );

      if (newMessages.length > 0) {
        setMessages(chatId, [...existingMessages, ...newMessages]);
      }
    } else {
      router.push('/');
      console.log('Error fetching messages:', getChatApi.error());
    }
  };

  const sendMessage = useCallback(
    async (userInput: string, messageId?: string, messageIndex?: number, onComplete?: (chatId: string) => void) => {
      let _chat_id = chatId || '';
      const _messageId = messageId || '';

      if (!userId || !userInput) return;

      setInitLoading(true);

      addMessage(_chat_id, { message_id: _messageId, role: ChatRole.USER, content: userInput }, messageIndex);

      const sendMessageData = await chatApi.call({
        chat_id: _chat_id,
        user_id: userId,
        message: userInput,
        message_id: _messageId,
        message_index: messageIndex,
        parameters,
      });

      if (!sendMessageData.error) {
        if (!_messageId) {
          updateMessageId(sendMessageData.chat_id, sendMessageData.message_id);
          onComplete?.(sendMessageData.chat_id);
        }
        _chat_id = pathname === '/' ? '' : sendMessageData.chat_id;
        startStream(sendMessageData.chat_id);
      }

    },
    [chatId, userId, addMessage, updateMessageId, startStream, setInitLoading, parameters, chatApi, pathname]
  );

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId);
    }
  }, [chatId]);

  const handleVoteMessage = (chatId: string, messageId: string, vote: VoteType) => {
    voteApi.call({ chat_id: chatId, message_id: messageId, vote_type: vote })
  }

  const handleDeleteChat = async (_chatId: string) => {
    deleteChatApi.call(_chatId);
  }

  const clear = () => {
    setChatId('');
    setInitLoading(false);
    setIsStreaming(false);
    setMessages('', []);
  }

  return (
    <ChatContext.Provider
      value={{
        chatId,
        messages: chatId !== null ? chatMessages[chatId] || [] : [],
        isStreaming,
        initLoading: initLoading || chatApi.loading(),
        chatLoading: getChatApi.loading(),
        sendMessage,
        closeStream,
        parameters,
        setParameters: updateParameters,
        handleVoteMessage,
        fetchChat,
        handleDeleteChat,
        clear,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
