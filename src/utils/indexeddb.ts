export type OpenOptions = {
  onBlocked?: (event: Event) => void;
  onUpgradeNeeded?: (event: Event) => void;
};

export type ObjectStoreIndex = {
  name: string,
  keyPath: string,
  parameters: IDBIndexParameters,
}

export type ObjectStore = {
  name: string;
  autoIncrement?: boolean;
  keyPath?: string[];
  indexes?: ObjectStoreIndex[]
};

/**
 * @param name
 * @param stores
 * @param version
 * @param options
 * @returns an initialized store
 */
export async function open(
  name: string,
  stores: ObjectStore[],
  version?: number,
  options: OpenOptions = {}
): Promise<IDBDatabase> {
  return new Promise(function (resolve, reject) {
    const { onBlocked, onUpgradeNeeded } = options;
    const request = indexedDB.open(name, version);
    if (onBlocked) {
      // DB needs to be updated but is locked, eventually in another tab
      request.onblocked = onBlocked;
    }
    if (stores.length > 0 || onUpgradeNeeded) {
      request.onupgradeneeded = (event) => {
        const database = request.result;
        const objectStoreNames = Array.from(database.objectStoreNames);
        stores.forEach(({name, indexes, ...options}) => {
          if (!objectStoreNames.includes(name)) {
            const store = database.createObjectStore(name, options);
            if (indexes) {
              indexes.forEach(({ name, keyPath, parameters }) => {
                store.createIndex(name, keyPath || name, parameters);
              });
            }
          }
        });
        if (onUpgradeNeeded) {
          onUpgradeNeeded(event);
        }
      };
    }
    request.onerror = () => {
      reject(request.error);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * @param db
 * @param storeName
 * @returns the latest key / value pair for this store
 */
export async function latest<T>(
  db: IDBDatabase,
  storeName: string
): Promise<{key: IDBValidKey, value: T} | null> {
  return new Promise(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .openCursor(null, 'prev');
    request.onsuccess = () => {
      if (request.result) {
        const { key, value } = request.result;
        resolve({key, value});
      }
    };
    request.onerror = reject;
  });
}

/**
 * @param db
 * @param storeName
 * @param key
 * @returns the value matching key in this store
 */
export async function get<T>(
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey
): Promise<T> {
  return new Promise(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .get(key);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = reject;
  });
}

/**
 * @param db
 * @param storeName
 * @returns all key / value pairs in this store
 */
export async function all<T>(
  db: IDBDatabase,
  storeName: string
): Promise<Map<IDBValidKey, T>> {
  return new Promise((resolve, reject) => {
    const result = new Map();
    const request = db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        result.set(cursor.primaryKey, cursor.value);
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    request.onerror = reject;
  });
}

/**
 * @param db
 * @param storeName
 * @returns all keys in this store
 */
export async function allKeys(
  db: IDBDatabase,
  storeName: string
): Promise<Set<IDBValidKey>> {
  return new Promise((resolve, reject) => {
    const result = new Set<IDBValidKey>();
    const request = db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .openKeyCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        result.add(cursor.primaryKey);
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    request.onerror = reject;
  });
}

/**
 * Save a key / value pair in this store
 *
 * @param db
 * @param storeName
 * @param key
 * @param value
 * @returns
 */
export async function save(db: IDBDatabase, storeName: string, key: IDBValidKey, value: any) {
  return new Promise<void>(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = reject;
  });
}

/**
 * Save a map of key / value pairs in this store
 *
 * @param db
 * @param storeName
 * @param map
 * @returns
 */
export async function saveAll(db: IDBDatabase, storeName: string, map: Map<IDBValidKey, any>) {
  return new Promise<void>(function (resolve, reject) {
    const tx = db.transaction(storeName, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = reject;

    const store = tx.objectStore(storeName);
    map.forEach((value, key) => {
      store.put(value, key);
    });

    tx.commit();
  });
}

/**
 * Clears all entries of this store
 *
 * @param db
 * @param storeName
 * @returns
 */
export async function clear(db: IDBDatabase, storeName: string) {
  return new Promise<void>(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .clear();
    request.onsuccess = () => resolve();
    request.onerror = reject;
  });
}
