// Lightweight async storage adapter for IndexedDB to use with zustand persist.

const DB_NAME = 'spotify-analytics';
const STORE_NAME = 'persist';
const DB_VERSION = 1;

type IDBValue = string;

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

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => void): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    action(store);
    tx.oncomplete = () => resolve(undefined as unknown as T);
    tx.onerror = () => reject(tx.error);
  });
}

export const idbStorage = {
  async getItem(name: string): Promise<IDBValue | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(name);
      req.onsuccess = () => resolve((req.result as IDBValue) ?? null);
      req.onerror = () => reject(req.error);
    });
  },
  async setItem(name: string, value: IDBValue): Promise<void> {
    await run('readwrite', (store) => store.put(value, name));
  },
  async removeItem(name: string): Promise<void> {
    await run('readwrite', (store) => store.delete(name));
  },
};
