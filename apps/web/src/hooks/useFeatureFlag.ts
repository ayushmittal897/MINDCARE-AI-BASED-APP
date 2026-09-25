import { useState, useEffect } from 'react';
import { api } from '@/api/client';

// Simple memory cache to prevent flickering on load
let featureFlagsCache: Record<string, boolean> | null = null;
let fetchPromise: Promise<any> | null = null;

export function useFeatureFlag(flagKey: string) {
  const [enabled, setEnabled] = useState<boolean>(
    featureFlagsCache ? !!featureFlagsCache[flagKey] : false
  );
  const [loading, setLoading] = useState<boolean>(!featureFlagsCache);

  useEffect(() => {
    let mounted = true;

    const fetchFlags = async () => {
      if (!featureFlagsCache) {
        if (!fetchPromise) {
          fetchPromise = api.get('/flags').then(res => res.data);
        }
        try {
          const flags = await fetchPromise;
          const cache: Record<string, boolean> = {};
          flags.forEach((f: any) => {
            cache[f.flagKey] = f.enabled;
          });
          featureFlagsCache = cache;
        } catch (err) {
          console.error("Failed to fetch feature flags", err);
          featureFlagsCache = {};
        }
      }

      if (mounted) {
        setEnabled(!!featureFlagsCache[flagKey]);
        setLoading(false);
      }
    };

    fetchFlags();

    return () => {
      mounted = false;
    };
  }, [flagKey]);

  return { enabled, loading };
}
