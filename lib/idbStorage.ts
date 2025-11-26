// Minimal IndexedDB-backed storage for Zustand persist.
// Stores raw string values keyed by name.

const DB_NAME = 'spotify-analytics';
const STORE_NAME = 'persist';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => void
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    fn(store);
    tx.oncomplete = () => resolve(undefined as unknown as T);
    tx.onerror = () => reject(tx.error);
  });
}

export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(name);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await withStore('readwrite', (store) => {
      store.put(value, name);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    await withStore('readwrite', (store) => {
      store.delete(name);
    });
  },
};

