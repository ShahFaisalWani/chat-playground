'use client';
import React from 'react';
import { useChatHistory } from "@/providers/chat-history-provider";
import { useRouter } from "next/navigation";
import { useChat } from "@/providers/chat-provider";
import clsx from 'clsx';
import { IoTrashBinSharp } from "react-icons/io5";

const ChatHistory: React.FC = () => {
  const { chatId, closeStream, handleDeleteChat, clear } = useChat();
  const { chatHistories } = useChatHistory();
  const router = useRouter();

  const handleChatSelection = (_chatId: string) => {
    if (_chatId !== chatId) {
      closeStream();
      router.push(`/chat/${_chatId}`);
    }
  };

  const onDeleteChat = (_chatId: string) => {
    handleDeleteChat(_chatId);
    if (_chatId === chatId) {
      clear()
      router.push(`/`);
    }
  };

  return (
    <div className="px-4 flex flex-col items-start gap-2 max-md:mb-4 max-md:mt-2">
      {chatHistories.map((chat) => (
        <div key={chat.chat_id} className="flex items-center gap-4 justify-between w-full group">
          <button
            onClick={() => handleChatSelection(chat.chat_id)}
            className={clsx('-btn py-2 text-md md:text-sm flex w-full text-left justify-start', chat.chat_id === chatId ? 'text-primary' : 'text-text')}
          >
            {chat.chat_title}
          </button>
          <button className="text-text-gray block md:opacity-0 group-hover:opacity-100 hover:text-red-400" onClick={() => onDeleteChat(chat.chat_id)}>
            <IoTrashBinSharp className="max-sm:text-base" />
          </button>
        </div>
      ))}
      {
        chatHistories.length === 0 && (
          <div className="text-text-gray text-sm w-full text-center max-md:mt-10">No chat history</div>
        )
      }
    </div>
  );
};

export default ChatHistory;
