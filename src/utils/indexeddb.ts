import { err, ok, Result } from '.';
import { areEquals } from './set';

export type OpenOptions = {
  onBlocked?: (event: Event) => void;
  onUpgradeNeeded?: (event: Event) => void;
};

export type ObjectStoreIndex = {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
};

export type ObjectStore = {
  name: string;
  indexes?: ObjectStoreIndex[];
  options?: IDBObjectStoreParameters;
};

function extractObjectStoreIndex(
  name: string,
  store: IDBObjectStore
): ObjectStoreIndex {
  const index = store.index(name);
  return {
    name,
    keyPath: index.keyPath,
  };
}

function extractIndexes(store: IDBObjectStore): ObjectStoreIndex[] | undefined {
  if (store.indexNames.length > 0) {
    return new Array(...store.indexNames).map((name) =>
      extractObjectStoreIndex(name, store)
    );
  }
}

function extractOptions(
  store: IDBObjectStore
): IDBObjectStoreParameters | undefined {
  const defaultAutoIncrement = store.autoIncrement
    ? { autoIncrement: store.autoIncrement }
    : null;
  const defaultKeyPath = store.keyPath ? { keyPath: store.keyPath } : null;
  if (defaultAutoIncrement || defaultKeyPath) {
    return {
      ...defaultAutoIncrement,
      ...defaultKeyPath,
    };
  }
}

function extractObjectStore(store: IDBObjectStore): ObjectStore {
  const indexes = extractIndexes(store);
  const defaultIndexes = indexes ? { indexes } : null;
  const options = extractOptions(store);
  const defaultOptions = options ? { options } : null;
  return {
    name: store.name,
    ...defaultIndexes,
    ...defaultOptions,
  };
}

function extractObjectStoresFromDB(dataBase: IDBDatabase): Array<ObjectStore> {
  const storeNames = new Array(...dataBase.objectStoreNames);
  if (storeNames.length > 0) {
    const transaction = dataBase.transaction(storeNames, 'readonly');
    return extractObjectStores(storeNames, transaction);
  }
  return [];
}

function extractObjectStores(
  storeNames: string[],
  transaction: IDBTransaction
): Array<ObjectStore> {
  return storeNames.map((storeName) =>
    extractObjectStore(transaction.objectStore(storeName))
  );
}

function createStore(
  database: IDBDatabase,
  { name, indexes, options }: ObjectStore
) {
  const store = database.createObjectStore(name, options);
  if (indexes) {
    indexes.forEach(({ name, keyPath, options }) => {
      store.createIndex(name, keyPath, options);
    });
  }
}

function updateStore(
  transaction: IDBTransaction,
  { name, options }: ObjectStore
): Result<boolean> {
  const objectStore = transaction.objectStore(name);
  // TODO add support for indexes reconciliation
  if (options) {
    const { autoIncrement, keyPath } = options;
    if (keyPath != objectStore.keyPath) {
      return err(new Error(`Unsupported keyPath modification: ${keyPath}`));
    }
    if (autoIncrement != objectStore.autoIncrement) {
      return err(
        new Error(`Unsupported autoIncrement modification: ${autoIncrement}`)
      );
    }
  }
  return ok(true);
}

function deleteStore(database: IDBDatabase, name: string): void {
  database.deleteObjectStore(name);
}

function isSameIndex(
  index1: ObjectStoreIndex,
  index2: ObjectStoreIndex
): boolean {
  return (
    index1.name == index2.name &&
    index1.keyPath == index2.keyPath &&
    index1.options?.multiEntry == index2.options?.multiEntry &&
    index1.options?.unique == index2.options?.unique
  );
}

function areSameIndexes(
  indexes1?: ObjectStoreIndex[],
  indexes2?: ObjectStoreIndex[]
): boolean {
  if (indexes1 == null || indexes2 == null) {
    return indexes1 == indexes2;
  }
  if (indexes1.length != indexes2.length) {
    return false;
  }
  const sort = (a: ObjectStoreIndex, b: ObjectStoreIndex) =>
    a.name > b.name ? 1 : a.name == b.name ? 0 : -1;
  const sortedIndexes1 = indexes1.sort(sort);
  const sortedIndexes2 = indexes2.sort(sort);
  return sortedIndexes1.every((o, index) =>
    isSameIndex(o, sortedIndexes2[index])
  );
}

function isSameStore(store1: ObjectStore, store2: ObjectStore): boolean {
  return (
    store1.name == store2.name &&
    areSameIndexes(store1.indexes, store2.indexes) &&
    store1.options?.autoIncrement == store2.options?.autoIncrement &&
    store1.options?.keyPath == store2.options?.keyPath
  );
}

function areSameStores(
  stores1: ObjectStore[],
  stores2: ObjectStore[]
): boolean {
  if (stores1.length != stores2.length) {
    return false;
  }
  const sort = (a: ObjectStore, b: ObjectStore) =>
    a.name > b.name ? 1 : a.name == b.name ? 0 : -1;
  const sortedStores1 = stores1.sort(sort);
  const sortedStores2 = stores2.sort(sort);
  return sortedStores1.every((o, index) =>
    isSameStore(o, sortedStores2[index])
  );
}

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
  version: number,
  options: OpenOptions = {}
): Promise<IDBDatabase> {
  const request = indexedDB.open(name, version);
  // Fail if no matching stores
  return new Promise((resolve, reject) => {
    const { onBlocked, onUpgradeNeeded } = options;
    if (onBlocked) {
      // DB needs to be updated but is locked, eventually in another tab
      request.onblocked = onBlocked;
    }
    if (stores.length > 0 || onUpgradeNeeded) {
      request.onupgradeneeded = (event) => {
        const transaction = request.transaction;
        if (!transaction) {
          // Can't happen as we are in an upgrade transaction
          return;
        }

        // Will be called before onsuccess, if the transaction version is incremented
        const database = request.result;
        const existingStores = new Map(
          extractObjectStores(
            new Array(...database.objectStoreNames),
            transaction
          ).map((store) => [store.name, store])
        );
        // 1. Create new stores
        const newStores = stores.filter(
          (store) => !existingStores.has(store.name)
        );
        newStores.forEach((store) => {
          createStore(database, store);
        });
        // 2. Updated existing stores with updated definitions
        stores.forEach((store) => {
          const existingStore = existingStores.get(store.name);
          if (existingStore && store != existingStore) {
            updateStore(transaction, store);
          }
        });

        // 3. Removed now undefined stores
        const removedStores = new Array(...existingStores.values()).filter(
          (existingStore) =>
            !stores.find((store) => store.name == existingStore.name)
        );
        removedStores.forEach((store) => {
          deleteStore(database, store.name);
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
      const database = request.result;
      if (
        version == database.version &&
        !areSameStores(stores, extractObjectStoresFromDB(database))
      ) {
        reject(
          new Error(`New store definitions but unchanged version (${version})`)
        );
      }
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
): Promise<{ key: IDBValidKey; value: T } | null> {
  return new Promise(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readonly')
      .objectStore(storeName)
      .openCursor(null, 'prev');
    request.onsuccess = () => {
      if (request.result) {
        const { key, value } = request.result;
        resolve({ key, value });
      } else {
        resolve(null);
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
export async function save(
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey,
  value: any
) {
  return new Promise<void>(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = reject;
  });
}

export async function remove(
  db: IDBDatabase,
  storeName: string,
  key: IDBValidKey
) {
  return new Promise<void>(function (resolve, reject) {
    const request = db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .delete(key);
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
export async function saveAll(
  db: IDBDatabase,
  storeName: string,
  map: Map<IDBValidKey, any>
) {
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
