import { useState, useEffect } from 'react';

export const useFirestoreQuery = (fetchFn, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetchFn()
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, deps);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    fetchFn().then(setData).catch(setError).finally(() => setLoading(false));
  }};
};
