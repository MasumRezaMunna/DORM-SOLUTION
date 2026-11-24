import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance configured for client-side persistence and stale-while-revalidate.
 *
 * Requirements:
 * - staleTime: 60s (prevents redundant immediate network calls while keeping data fresh)
 * - gcTime: 24h (retains inactive queries in memory and IndexedDB)
 * - networkMode: 'offlineFirst' (immediately serves cached queries if offline or slow)
 * - retry: 1 (safe single retry on network blips)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
      gcTime: 1000 * 60 * 60 * 24,
      networkMode: 'offlineFirst',
    },
  },
});
