import { get, set, del, createStore } from 'idb-keyval';

/**
 * Dedicated IndexedDB database and store for Dorm Solution client persistence.
 * IndexedDB provides non-blocking, multi-megabyte structured storage,
 * completely avoiding the 5MB quota and synchronous blocking of localStorage.
 */
const dormIdbStore = createStore('dorm-solution-idb', 'query-cache');

/**
 * Returns the current active user ID from localStorage synchronously
 * so the persister can hydrate the right account's cache before React renders.
 */
export const getActiveUserId = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?._id || parsed?.id || null;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Build an isolated IndexedDB storage key for the given user ID.
 * Guarantees manager, member, and different accounts never cross-contaminate.
 */
export const getStorageKey = (userId) => {
  const uid = userId || getActiveUserId();
  return uid ? `dorm_query_cache_${uid}` : 'dorm_query_cache_guest';
};

/**
 * Creates an IndexedDB persister conforming to TanStack Query Persister interface.
 * Handles background dehydration to and rehydration from IndexedDB.
 */
export const createIdbPersister = (customUserId = null) => {
  return {
    persistClient: async (persistedClient) => {
      try {
        const key = getStorageKey(customUserId);
        await set(key, persistedClient, dormIdbStore);
      } catch (err) {
        console.warn('[DormCache] Failed to persist queries to IndexedDB:', err.message);
      }
    },
    restoreClient: async () => {
      try {
        const key = getStorageKey(customUserId);
        const data = await get(key, dormIdbStore);
        return data;
      } catch (err) {
        console.warn('[DormCache] Failed to restore queries from IndexedDB:', err.message);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        const key = getStorageKey(customUserId);
        await del(key, dormIdbStore);
      } catch (err) {
        console.warn('[DormCache] Failed to remove client from IndexedDB:', err.message);
      }
    },
  };
};

/**
 * Default singleton persister using active user ID.
 */
export const idbPersister = createIdbPersister();

/**
 * Purges the persisted IndexedDB cache for a specific user.
 * Must be called on logout to enforce strict privacy between users sharing a device.
 */
export const clearUserCache = async (userId) => {
  const key = getStorageKey(userId);
  try {
    await del(key, dormIdbStore);
  } catch (err) {
    console.warn('[DormCache] Failed to clear user cache:', err.message);
  }
};

/**
 * Dehydration filter:
 * Persists only successful API responses, while excluding sensitive auth credentials,
 * passwords, tokens, or transient chat streams.
 */
export const dehydrateOptions = {
  shouldDehydrateQuery: (query) => {
    // Only dehydrate successful queries
    if (query.state.status !== 'success') return false;

    // Do not persist error states or empty/undefined payloads
    if (query.state.data === undefined || query.state.data === null) return false;

    const queryKey = query.queryKey;
    if (!Array.isArray(queryKey)) return true;

    const domain = String(queryKey[0]);
    // Blacklist sensitive or ephemeral domains
    const blacklist = ['auth', 'chat', 'token'];
    if (blacklist.includes(domain)) return false;

    return true;
  },
};

/**
 * Persistence configuration options for TanStack Query
 */
export const persistOptions = {
  persister: idbPersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days max age for persisted cache
  buster: 'v1.0.1', // Increment when query schema structure changes
  dehydrateOptions,
};
