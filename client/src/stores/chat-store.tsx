import { create } from 'zustand';
import { MessageType, ChatHistoryType, FinalChunkType } from '@/types';
import { ChatRole, VoteType } from '@/enums';

interface ChatState {
  chatMessages: Record<string, MessageType[]>;
  chatMessageMap: Record<string, Record<string, MessageType>>;
  chatHistories: ChatHistoryType[];
  setChatHistories: (histories: ChatHistoryType[]) => void;
  setMessages: (chatId: string, messages: MessageType[]) => void;
  addMessage: (chatId: string, message: MessageType, index?: number) => void;
  updateMessageId: (chatId: string, messageId: string) => void;
  updateMessageById: (chatId: string, messageId: string, message: { content: string, finalData?: FinalChunkType }) => void;
  isStreaming: boolean;
  setIsStreaming: (status: boolean) => void;
  initLoading: boolean;
  setInitLoading: (status: boolean) => void;
  clearChatStore: () => void;
  updateVote: (chatId: string, messageId: string, vote: VoteType) => void;
  removeChat: (chatId: string) => void;
}

const useChatStore = create<ChatState>((set) => ({
  chatMessages: {},
  chatMessageMap: {},
  chatHistories: [],
  isStreaming: false,
  initLoading: false,

  setChatHistories: (histories: ChatHistoryType[]) => set(() => ({
    chatHistories: histories,
  })),

  setMessages: (chatId: string, messages: MessageType[]) => set((state) => {
    const messageMap = messages.reduce((acc, message) => {
      acc[message.message_id] = message;
      return acc;
    }, {} as Record<string, MessageType>);

    return {
      chatMessages: {
        ...state.chatMessages,
        [chatId]: messages,
      },
      chatMessageMap: {
        ...state.chatMessageMap,
        [chatId]: messageMap,
      },
    };
  }),

  addMessage: (chatId: string, message: MessageType, index?: number) => set((state) => {
    const chatMessages = state.chatMessages[chatId] || [];
    const messageMap = state.chatMessageMap[chatId] || {};

    if (index != null) {
      const updatedMessages = [
        ...chatMessages.slice(0, index),
        message,
      ];

      messageMap[message.message_id] = message;

      return {
        chatMessages: {
          ...state.chatMessages,
          [chatId]: updatedMessages,
        },
        chatMessageMap: {
          ...state.chatMessageMap,
          [chatId]: messageMap,
        },
      };
    }

    messageMap[message.message_id] = message;

    return {
      chatMessages: {
        ...state.chatMessages,
        [chatId]: [...chatMessages, message],
      },
      chatMessageMap: {
        ...state.chatMessageMap,
        [chatId]: messageMap,
      },
    };
  }),

  updateMessageId: (chatId: string, newMessageId: string) => set((state) => {
    const emptyChatMessages = [...(state.chatMessages[""] || [])];
    const chatMessages = [...(state.chatMessages[chatId] || emptyChatMessages)];
    const messageMap = { ...(state.chatMessageMap[chatId] || {}) };

    const lastUserMessageIndex = chatMessages
      .slice()
      .reverse()
      .findIndex((message) => message.role === ChatRole.USER);

    if (lastUserMessageIndex !== -1) {
      const actualIndex = chatMessages.length - 1 - lastUserMessageIndex;
      const messageToUpdate = chatMessages[actualIndex];

      const updatedMessage = {
        ...messageToUpdate,
        message_id: newMessageId,
      };

      chatMessages[actualIndex] = updatedMessage;
      delete messageMap[messageToUpdate.message_id];
      messageMap[newMessageId] = updatedMessage;
    }


    return {
      chatMessages: {
        ...state.chatMessages,
        [chatId]: chatMessages,
      },
      chatMessageMap: {
        ...state.chatMessageMap,
        [chatId]: messageMap,
      },
    };
  }),

  updateMessageById: (chatId: string, messageId: string, message: { content: string, finalData?: FinalChunkType }) => {
    set((state) => {
      const chatMessages = [...(state.chatMessages[chatId] || [])];
      const messageMap = { ...(state.chatMessageMap[chatId] || {}) };

      const existingMessage = messageMap[messageId];

      if (existingMessage) {
        existingMessage.content += message.content;
        if (message.finalData) {
          Object.assign(existingMessage, message.finalData);
        }
      } else {
        const newMessage: MessageType = {
          message_id: messageId,
          role: ChatRole.ASSISTANT,
          content: message.content || '',
          ...message.finalData,
        };

        chatMessages.push(newMessage);
        messageMap[messageId] = newMessage;
      }

      return {
        chatMessages: {
          ...state.chatMessages,
          [chatId]: chatMessages,
        },
        chatMessageMap: {
          ...state.chatMessageMap,
          [chatId]: messageMap,
        },
      };
    });
  },

  updateVote: (chatId: string, messageId: string, vote: VoteType) => {
    set((state) => {
      const chatMessages = [...(state.chatMessages[chatId] || [])];
      const messageMap = { ...(state.chatMessageMap[chatId] || {}) };

      const messageToUpdate = messageMap[messageId];

      if (messageToUpdate) {
        messageToUpdate.vote = vote;
      }

      return {
        chatMessages: {
          ...state.chatMessages,
          [chatId]: chatMessages,
        },
        chatMessageMap: {
          ...state.chatMessageMap,
          [chatId]: messageMap,
        },
      };
    });
  },

  removeChat: (chatId: string) => set((state) => {
    const chatMessageMap = { ...state.chatMessageMap };
    delete chatMessageMap[chatId];

    return {
      chatHistories: state.chatHistories.filter(chat => chat.chat_id !== chatId),
      chatMessages: Object.keys(state.chatMessages).reduce((acc, id) => {
        if (id !== chatId) {
          acc[id] = state.chatMessages[id];
        }
        return acc;
      }, {} as Record<string, MessageType[]>),
      chatMessageMap,
    };
  }),

  setIsStreaming: (status: boolean) => set({ isStreaming: status }),
  setInitLoading: (status: boolean) => set({ initLoading: status }),

  clearChatStore: () => set({ chatMessages: {}, chatMessageMap: {}, chatHistories: [], isStreaming: false, initLoading: false }),
}));

export default useChatStore;
