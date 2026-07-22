import { useCallback, useEffect, useState } from 'react';
import { fetchTokens } from '../lib/prices';
import type { Token } from '../types';

interface UseTokensResult {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useTokens(): UseTokensResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchTokens(controller.signal)
      .then((next) => {
        setTokens(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setLoading(false);
      });

    return () => controller.abort();
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { tokens, loading, error, reload };
}
