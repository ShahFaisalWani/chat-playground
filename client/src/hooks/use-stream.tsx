import { ChatRole } from "@/enums";
import useChatStore from "@/stores/chat-store";
import { useApiClient } from "@/providers/api-provider";
import { useNotify } from "./use-notify";

let streamController: AbortController | null = null;

export const useStream = () => {
  const { addMessage, updateMessageById, setInitLoading } = useChatStore();
  const { setIsStreaming } = useChatStore();
  const { streamChat } = useApiClient();
  const { notify } = useNotify();

  const startStream = async (stream_chat_id: string) => {
    streamController = new AbortController();
    const signal = streamController.signal;

    const onMessage = (parsedData: any) => {
      const { event, message_id, content } = parsedData;

      if (event === 'start') {
        addMessage(stream_chat_id, { message_id, role: ChatRole.ASSISTANT, content: '' });
      } else if (event === 'message') {
        updateMessageById(stream_chat_id, message_id, { content });
      } else if (event === 'complete') {
        const { completion_tokens, response_time } = parsedData;
        updateMessageById(stream_chat_id, message_id, { content: '', finalData: { completion_tokens, response_time } });
      }
    };

    const onComplete = () => {
      console.log('Stream completed');
      closeStream();
    };

    const onError = (err: any) => {
      if (err.name === 'AbortError') {
        console.log('Stream aborted');
        return
      }
      notify('Error', err.message || 'Stream error occurred', 'error');
      closeStream();
    };

    streamChat(stream_chat_id, signal, onMessage, onComplete, onError);
  };

  const closeStream = () => {
    console.log('Cancel stream');
    if (streamController) {
      streamController.abort();
      streamController = null;
    }
    setIsStreaming(false);
    setInitLoading(false);
  };

  return { startStream, closeStream };
};
