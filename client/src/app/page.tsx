'use client';
import { useRouter } from 'next/navigation';
import { useChatHistory } from "@/providers/chat-history-provider";
import ChatContainer from "../components/chat-container";

export default function ChatStream() {
  const router = useRouter();
  const { refetch } = useChatHistory();

  const onComplete = (chatId: string) => {
    refetch();
    router.push(`/chat/${chatId}`);
  };

  return (
    <ChatContainer onComplete={onComplete} />
  );
}
