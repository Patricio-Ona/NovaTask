import { useCallback, useEffect, useState } from "react";

export const useAsyncData = (factory, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await factory();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (!immediate) return;
    execute().catch(() => {});
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute, setData };
};
