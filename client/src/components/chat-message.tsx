import { ChatRole, VoteType } from "@/enums";
import { MessageType } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { MdOutlineThumbUp, MdOutlineThumbDown, MdEdit } from "react-icons/md";
import { AiOutlineRedo } from "react-icons/ai";
import { IoCopy } from "react-icons/io5";
import MarkdownRenderer from "./ui/markdown-renderer";
import clsx from "clsx";
import { FaCheck } from "react-icons/fa6";

interface MessageProps {
  message: MessageType;
  isStreaming: boolean;
  initLoading: boolean;
  handleVote: (messageId: string, vote: VoteType) => void;
  handleSendMessage: (userInput: string, messageId?: string) => void;
  lastUserMessage?: string;
  lastAssistantMessage?: string;
}

const ChatMessage: React.FC<MessageProps> = ({
  message,
  isStreaming,
  initLoading,
  handleVote,
  handleSendMessage,
  lastUserMessage,
  lastAssistantMessage
}) => {
  const isFromUser = message.role === ChatRole.USER;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [containsCodeBlock, setContainsCodeBlock] = useState(false);
  const userInputRef = useRef<HTMLParagraphElement>(null);
  const [editWidth, setEditWidth] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (userInputRef.current) {
      const width = userInputRef.current.getBoundingClientRect().width;
      setEditWidth(width < 400 ? 400 : width);
    }
  }, []);

  const handleEditToggle = (toggle: boolean) => {
    setIsEditing(toggle);
    if (!toggle) setEditedContent(message.content);
  };

  const handleEditSubmit = () => {
    handleSendMessage(editedContent, message.message_id);
    setIsEditing(false);
  };

  const handleRegenerateMessage = () => {
    handleSendMessage(message.content, message.message_id);
  };

  const handleCopy = () => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(message.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        alert('Copy failed. Please try again.');
      });
    } else {
      alert('Your browser does not support clipboard functionality. Please copy manually.');
    }
  };

  const isLoading = isStreaming || initLoading

  return (
    <div className="relative">
      <div className={`flex ${isFromUser ? "flex-row-reverse" : "flex-row"} group`}>
        <div
          className={`relative text-text max-w-[100%] md:max-w-[95%] py-2 rounded-lg ${isFromUser ? "md:max-w-[80%]" : "mr-auto px-2 md:px-4"}`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 bg-gray rounded-2xl px-1 py-2">
              <textarea
                className="bg-transparent text-text flex-1 px-4 pt-2"
                style={{ width: editWidth }}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={5}
              />
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => handleEditToggle(false)}
                  className="btn-red border border-gray-10 hover:bg-gray-10 text-xs p-2 w-20 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="btn border border-gray-10 hover:bg-gray-10 text-xs p-2 w-20 rounded-xl"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className={clsx("rounded-lg", isFromUser ? "max-md:mr-6 rounded-br-none bg-gray py-2 px-4" : "")}>
              <div ref={userInputRef}>
                <MarkdownRenderer content={message.content} setContainsCodeBlock={setContainsCodeBlock} />
              </div>
              {!isFromUser && !containsCodeBlock && (
                <button
                  onClick={handleCopy}
                  disabled={copied}
                  className={clsx(
                    'absolute right-[0rem] md:right-[-2rem] top-1/2 -translate-y-1/2 transform translate-x-full text-text-gray hover:text-primary hidden',
                    (lastAssistantMessage === message.message_id && isLoading) ? 'hidden' : 'md:block'
                  )}
                >
                  {copied ? <FaCheck className="text-text-gray" size="1rem" /> : <IoCopy className="text-text-gray hover:text-primary" size="1rem" />}
                </button>
              )}
              {isFromUser && !isLoading && (
                <button
                  disabled={isLoading}
                  onClick={() => handleEditToggle(true)}
                  className="text-text-gray cursor-pointer hover:text-primary absolute left-[-0.5rem] top-1/2 -translate-y-1/2 transform -translate-x-full group-hover:block md:hidden"
                >
                  <MdEdit className="text-text-gray hover:text-primary" size="1.25rem" />
                </button>
              )}
              {!isFromUser && (!isLoading || (lastAssistantMessage !== message.message_id)) &&
                <div className="flex items-end md:items-center gap-2 mt-1">
                  {message.completion_tokens && message.response_time && (
                    <>
                      <button
                        className="flex gap-2"
                        onClick={() => handleVote(message.message_id, VoteType.UpVote)}
                      >
                        <MdOutlineThumbUp
                          className={clsx(message.vote === VoteType.UpVote ? "text-primary" : "text-text-gray", "max-md:text-md")}
                        />
                      </button>
                      <button
                        className="flex gap-2"
                        onClick={() => handleVote(message.message_id, VoteType.DownVote)}
                      >
                        <MdOutlineThumbDown
                          className={clsx(message.vote === VoteType.DownVote ? "text-primary" : "text-text-gray", "max-md:text-md")}
                        />
                      </button>
                      <p className="text-text-gray text-xxs">
                        {message.completion_tokens} tokens | {parseFloat(message.response_time).toFixed(2)} seconds
                      </p>
                      {!containsCodeBlock &&
                        <button
                          onClick={handleCopy}
                          className="text-text-gray h-6 ml-2 -mt-6 md:hidden"
                        >
                          {copied ? <span className="flex items-center gap-1"><FaCheck /> Copied </span> : <IoCopy size="1.25rem" />}
                        </button>
                      }
                    </>
                  )}
                </div>}
            </div>
          )}
        </div>
      </div>
      {isFromUser && !isEditing && (
        <button
          disabled={isLoading}
          onClick={handleRegenerateMessage}
          className={clsx('flex items-start absolute right-[-1rem] md:right-[-3rem] top-1/2 -translate-y-1/2 -translate-x-full',
            (lastUserMessage === message.message_id && isLoading) ? 'hidden' : ''
          )}
        >
          <AiOutlineRedo className="text-text-gray hover:text-primary" size="1.25rem" />
        </button>
      )}
    </div>
  );
};

export default ChatMessage;
