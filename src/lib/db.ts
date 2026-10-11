import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'uniflow_offline';
const STORE_NAME = 'sync_queue';

export async function initOfflineDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      db.createObjectStore('data_cache', { keyPath: 'key' });
    },
  });
}

export async function addToSyncQueue(data: any) {
  const db = await initOfflineDB();
  return db.add(STORE_NAME, { ...data, timestamp: Date.now() });
}

export async function getFromCache(key: string) {
  const db = await initOfflineDB();
  return db.get('data_cache', key);
}

export async function setCache(key: string, value: any) {
  const db = await initOfflineDB();
  return db.put('data_cache', { key, value });
}
