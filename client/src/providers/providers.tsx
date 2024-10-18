'use client';

import { ChatProvider } from "./chat-provider";
import { ChatHistoryProvider } from "./chat-history-provider";
import { ChakraProvider } from '@chakra-ui/react'
import { WebSocketProvider } from "./websocket-provider";
import { AuthProvider } from "./auth-provider";
import { ApiProvider } from "./api-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ChakraProvider resetCSS={false} disableGlobalStyle={true}>
      <AuthProvider>
        <ApiProvider>
          <ChatHistoryProvider>
            <ChatProvider>
              <WebSocketProvider>
                {children}
              </WebSocketProvider>
            </ChatProvider>
          </ChatHistoryProvider>
        </ApiProvider>
      </AuthProvider>
    </ChakraProvider>
  );
};
