import { useRef } from 'react';
import { HttpError, HttpRes } from '@/utils/http';

export function useApi<R, A extends any[]>(
  apiFn: (...args: A) => Promise<HttpRes<R>>,
  onSuccess?: (res: R) => void,
  onError?: (err: HttpError) => void
) {
  const errorRef = useRef<HttpError>();
  const loadingRef = useRef<boolean>(false);

  const call = async (...args: A) => {
    loadingRef.current = true;
    errorRef.current = undefined;
    const res = await apiFn(...args);
    loadingRef.current = false;
    if (res?.error) {
      errorRef.current = res.error;
      onError?.(res.error);
    } else {
      onSuccess?.(res as R);
    }
    return res;
  };

  const reset = () => {
    loadingRef.current = false;
    errorRef.current = undefined;
  };

  return {
    call,
    loading: () => loadingRef.current,
    error: () => errorRef.current?.message,
    reset,
  };
}

