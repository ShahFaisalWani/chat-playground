import {
  HTTP,
  HTTPMethod,
  HttpError,
  HttpArgs,
  HTTPStream,
} from "@/utils/http";

export type HttpApiCall = {
  method: HTTPMethod;
  path: string;
  payload?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  signal?: AbortSignal;
};

export const useHttp = (
  baseUrl: string,
  getJwt?: () => string | null,
  getHeaders?: Record<string, () => any>,
  errHandler?: (err: HttpError) => void
) => {
  const resolveArgs = (args: HttpApiCall): HttpArgs => {
    const headers = { ...args.headers };

    if (getHeaders) {
      for (const key in getHeaders) {
        headers[key] = getHeaders[key]();
      }
    }

    return {
      method: args.method,
      url: baseUrl + args.path,
      payload: args.payload,
      params: args.params,
      headers: headers,
      ...(getJwt && { jwt: getJwt() }),
      signal: args.signal,
    };
  };

  const http = async <R>(args: HttpApiCall) => {
    const res = await HTTP<R>(resolveArgs(args));

    if (res?.error) {
      errHandler?.(res.error);
    }

    return res;
  };

  const httpStream = async (
    args: HttpApiCall,
    onMessage: (message: any) => void,
    onComplete?: () => void,
    onError?: (err: any) => void
  ) => {
    try {
      const reader = await HTTPStream(resolveArgs(args), onError);

      if (!reader) {
        return console.log("No stream reader");
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          for (const event of events) {
            if (event.trim()) {
              try {
                const parsedEvent = JSON.parse(event);
                onMessage(parsedEvent);
              } catch (error) {
                console.error("Error parsing stream event:", error);
                onError?.(error);
              }
            }
          }

          buffer = "";
        }
      }
      onComplete?.();
    } catch (error) {
      onError?.(error);
    }
  };

  return {
    http,
    httpStream,
  };
};
