'use client';
import { useChat } from "@/providers/chat-provider";
import useChatStore from "@/stores/chat-store";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import { FaBars, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { RiChatNewFill } from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";
import { RiLogoutBoxLine } from "react-icons/ri";
import Link from "next/link";
import ChatHistory from "./chat-history";
import ChatParams from "./chat-params";
import ChatBox from "./chat-box";

interface ChatContainerProps {
  onComplete?: (chatId: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ onComplete }) => {
  const [opened, setOpened] = useState<string>();
  const { setMessages } = useChatStore();
  const { parameters } = useChat();
  const { auth, logout } = useAuth();
  const router = useRouter();

  const handleNewChat = async () => {
    setMessages('', []);
    router.push(`/`);
  };

  const handleClick = (name: string) => {
    if (opened === name) {
      setOpened(undefined);
    } else {
      setOpened(name);
    }
  };

  return (
    <div className="h-full relative flex justify-center">
      <div className="flex flex-col md:flex-row w-full h-full bg-gray px-2 md:px-4 md:rounded-xl shadow-md shadow-gray">

        <div className="md:hidden flex justify-between items-center px-4 absolute top-0 left-0 right-0 z-20 h-14">
          <button
            onClick={() => handleClick('history')}
            className="-btn text-[1.5rem] rounded-md">
            {opened === 'history' ? <FaTimes /> : <FaBars />}
          </button>
          <button onClick={() => handleClick('params')} className="w-60 flex items-center justify-center gap-2 py-1 px-2 md:px-4 text-xs rounded-2xl bg-gray-10">
            <h1 className="text-text-10 text-xs font-normal">
              {parameters.model}
            </h1>
            {opened === 'params' ? <FaChevronUp size={15} className="group-hover:text-primary" /> : <FaChevronDown size={15} className="group-hover:text-primary" />}
          </button>
          <button className="-btn text-[1.5rem]" onClick={handleNewChat}>
            <RiChatNewFill />
          </button>
        </div>

        <div
          className={`w-full md:w-1/5 h-full border-r-2 border-bg overflow-hidden md:flex md:flex-col md:max-h-[90dvh]
              ${opened === 'history' ? 'block absolute top-0 left-0 w-full h-full z-[11] bg-gray mt-10' : 'hidden md:block'}`}
        >
          <div className="hidden md:flex justify-between items-center p-4 md:bg-transparent">
            <h1 className="text-sm font-normal text-text-gray">History</h1>
            <button className="-btn mr-4" onClick={handleNewChat}>
              <RiChatNewFill className="text-lg" />
            </button>
          </div>
          <div className="flex-1 overflow-auto mt-6 my-4 max-md:max-h-[85%] max-md:border-t-2 border-gray-10">
            <ChatHistory />
          </div>
          <div className="md:hidden w-full flex flex-col justify-center absolute rounded-t-3xl bg-gray-20 bottom-10 py-2 px-4">
            {
              auth.logged_in ?
                <div className="flex px-2 py-4 justify-between items-center h-4/5">
                  <div className="text-lg font-medium bg-gray-20 mb-2">
                    <span className="rounded-full bg-primary text-white font-bold text-center px-3 py-2 mr-2">{auth.username ? auth.username[0].toUpperCase() : ''}</span>
                    <span className="text-md text-text">{auth.username ? `${auth.username.substring(0, 15)}${auth.username.length > 15 ? '...' : ''}` : ''}</span>
                  </div>
                  <button className="flex gap-2 text-red-400 font-medium" onClick={logout}>
                    <RiLogoutBoxLine size="1.5rem" className="ml-1" /> Logout
                  </button>
                </div>
                :
                <div className="flex flex-col justify-center w-full gap-2 px-8">
                  <Link href="/login" >
                    <button className="-btn border-gradient w-full text-text font-medium px-8 h-10 flex justify-center items-center gap-2 rounded-xl">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" >
                    <button className="-btn border-gradient w-full text-text font-medium px-8 h-10 flex justify-center items-center gap-2 rounded-xl">
                      Register
                    </button>
                  </Link>
                </div>
            }
          </div>
        </div>

        <div className="w-full md:w-3/5 flex flex-col h-full max-md:pt-12">
          <div className="hidden md:flex gap-2 items-center p-4">
            <h1 className="text-lg font-normal">Chat</h1>
            <h1 className="bg-bg h-fit py-0.5 px-4 rounded-2xl text-xs text-text-gray font-normal">
              typhoon.ai/{parameters.model}
            </h1>
          </div>
          <div className="flex-grow overflow-auto md:p-4">
            <ChatBox onComplete={onComplete} />
          </div>
        </div>

        <div
          className={`w-full md:w-1/5 h-full overflow-hidden md:flex md:flex-col pt-16 md:pt-14
              ${opened === 'params' ? 'block absolute -top-0 right-0 w-full h-full z-[11] bg-gray' : 'hidden md:block'}`}
        >
          <div className="flex-1 overflow-auto max-md:border-t-2 border-gray-10">
            <ChatParams />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
