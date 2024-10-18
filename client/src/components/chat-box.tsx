'use client';
import { useChat } from "@/providers/chat-provider";
import React, { useState, useRef, useEffect } from 'react';
import { FaRegPaperPlane } from "react-icons/fa6";
import ChatMessage from "./chat-message";
import { VoteType } from "@/enums";
import { FaSpinner } from "react-icons/fa";
import Button from "@/components/ui/button";
import { debounce } from '@/utils/debounce';
import { useAuth } from "@/providers/auth-provider";
import { ChatRole } from '@/enums';
import { FaRegCircleStop } from "react-icons/fa6";
import { useNotify } from "@/hooks/use-notify";

interface ChatBox {
  onComplete?: (chatId: string) => void;
}

const ChatBox: React.FC<ChatBox> = ({ onComplete }) => {
  const { chatId, messages, isStreaming, initLoading, chatLoading, sendMessage, closeStream, handleVoteMessage } = useChat();
  const [userInput, setUserInput] = useState<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { auth } = useAuth();
  const { notify } = useNotify();
  const [lastUserMessageId, setLastUserMessageId] = useState<string>();
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string>();

  const handleMessageSend = (userInput: string, messageId?: string, messageIndex?: number) => {
    if (!userInput.trim()) return;

    if (!auth.logged_in) {
      notify('Error', 'Please login first.', 'error');
      return;
    }
    sendMessage(userInput, messageId, messageIndex, onComplete);
    setUserInput('');
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "4rem";
    }
  };

  const handleVote = (messageId: string, vote: VoteType) => {
    handleVoteMessage(chatId, messageId, vote);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (textAreaRef.current) {
        handleMessageSend(textAreaRef.current.value);
        textAreaRef.current.value = '';
      }
    }
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = debounce(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, 200);

  useEffect(() => {
    scrollToBottom();

    const lastUserMessageIndex = messages.slice().reverse().findIndex((message) => message.role === ChatRole.USER);
    const lastUserMessagePos = lastUserMessageIndex !== -1 ? messages.length - 1 - lastUserMessageIndex : -1;

    const lastAssistantMessage = lastUserMessagePos !== -1
      ? messages.slice(lastUserMessagePos + 1).reverse().find((message) => message.role === ChatRole.ASSISTANT)
      : null;

    setLastUserMessageId(lastUserMessageIndex !== -1 ? messages[lastUserMessagePos].message_id : '');
    setLastAssistantMessageId(lastAssistantMessage ? lastAssistantMessage.message_id : '');
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-full relative">
      <div ref={chatContainerRef} className="flex-grow md:pt-4 md:pl-4 md:pr-16 overflow-y-auto bg-bg rounded-lg relative scroll-smooth mb-20"> {/*max-h-[85%] */}
        {chatLoading && (
          <div className="absolute w-full h-full bg-bg flex items-center justify-center">
            <FaSpinner className="animate-spin" size="5rem" />
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isStreaming={isStreaming}
            initLoading={initLoading}
            handleVote={handleVote}
            handleSendMessage={(userInput, messageId) => handleMessageSend(userInput, messageId, index)}
            lastUserMessage={lastUserMessageId}
            lastAssistantMessage={lastAssistantMessageId}
          />
        ))}
      </div>
      <div className="absolute bottom-1 md:bottom-0 left-0 right-0 z-10">
        <div className="flex items-end gap-2">
          <textarea
            ref={textAreaRef}
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              autoResizeTextarea(e);
            }}
            placeholder="Enter text here..."
            className="-text-area flex-grow w-full min-h-[4.5rem] max-h-[30vh] h-[3.5rem] transition-all duration-200 overflow-y-auto p-3 pr-12 rounded-lg"
            onKeyDown={handleKeyDown}
            style={{ resize: 'none' }}
          />
          <div className="flex items-center">
            <Button
              text="Send"
              cancelText="Stop"
              icon={<FaRegPaperPlane />}
              stopIcon={<FaRegCircleStop />}
              className="-btn border-gradient w-10 md:w-32 text-text font-medium px-2 md:px-8 h-10 flex justify-center items-center gap-2 rounded-xl mb-4"
              loading={initLoading || isStreaming}
              onClick={initLoading || isStreaming ? closeStream : () => handleMessageSend(userInput)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;