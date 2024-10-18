import { ChatRole, VoteType } from "./enums";

export type FinalChunkType = {
  completion_tokens: number;
  response_time: string;
};

export type MessageType = {
  message_id: string;
  role: ChatRole;
  content: string;
  completion_tokens?: number;
  response_time?: string;
  vote?: VoteType;
};

export type ChatHistoryType = {
  chat_id: string;
  chat_title: string;
  timestamp: string;
};

export type ChatParameterType = {
  output_length: number;
  temperature: number;
  top_p: number;
  repetition_penalty: number;
  model: string;
};

export type AuthType = {
  logged_in: boolean;
  user_id: string | null;
  username?: string;
  email?: string;
};

export type UserType = {
  user_id: string;
  username: string;
  email: string;
};
