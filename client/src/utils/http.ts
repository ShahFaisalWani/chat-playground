export enum HTTPMethod {
  Get = "GET",
  Post = "POST",
  Patch = "PATCH",
  Put = "PUT",
  Delete = "DELETE",
}

export type HttpArgs = {
  method: HTTPMethod;
  url: string;
  payload?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  jwt?: string | null;
  signal?: AbortSignal;
};

export type HttpError = {
  status: number;
  message: string;
  data?: any;
};

export type HttpRes<R> = R & { error?: HttpError };

const resolveFetchOptions = (args: HttpArgs) => {
  const url = args.params
    ? `${args.url}?${new URLSearchParams(args.params)}`
    : args.url;

  const headers = {
    "Content-Type": "application/json",
    ...(args.jwt && { Authorization: `Bearer ${args.jwt}` }),
    ...args.headers,
  };

  const options: RequestInit = {
    method: args.method,
    headers,
    body: args.payload ? JSON.stringify(args.payload) : undefined,
    signal: args.signal,
  };

  return { url, options };
};

export const HTTP = async <R>(args: HttpArgs): Promise<HttpRes<R>> => {
  const { url, options } = resolveFetchOptions(args);

  const res = await fetch(url, options);
  const resJson = await res.json();

  if (!res.ok) {
    return {
      error: {
        ...resJson,
      },
    } as HttpRes<R>;
  }

  return resJson;
};

export const HTTPStream = async (
  args: HttpArgs,
  onError?: (err: any) => void
): Promise<ReadableStreamDefaultReader<Uint8Array> | undefined> => {
  const { url, options } = resolveFetchOptions(args);

  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const error = await res.json();
      onError?.(error);
      throw error;
    }

    if (!res.body) {
      const error = new Error("No response body");
      onError?.(error);
      throw error;
    }

    return res.body.getReader();
  } catch (error) {
    onError?.(error);
    throw error;
  }
};
