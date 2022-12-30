import { open } from './indexeddb';

const DB_NAME = 'polkadot/governance/store';

export enum Stores {
  AccountVote = 'AccountVote',
}

export class Store<T> {
  #db: IDBDatabase;
  #name: string;

  constructor(db: IDBDatabase, name: string) {
    this.#db = db;
    this.#name = name;
  }

  static async storeFor<T>(name: string): Promise<Store<T>> {
    const db = await open(DB_NAME, name);
    db.onversionchange = () => {
      // A new version of the app is trying to update the db but can't unless it's closed here
      // TODO Offer user action that will call `db.close()`, then app should be re freshed.
    };
    return new Store(db, name);
  }

  async save(index: number, t: T) {
    const db = this.#db;
    const name = this.#name;
    return new Promise<void>(function (resolve, reject) {
      const request = db
        .transaction(name, 'readwrite')
        .objectStore(name)
        .put(t, index);
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  async saveAll(map: Map<number, T>) {
    const db = this.#db;
    const name = this.#name;
    return new Promise<void>(function (resolve, reject) {
      const tx = db.transaction(name, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = reject;

      const store = tx.objectStore(name);
      map.forEach((value, key) => {
        store.put(value, key);
      });

      tx.commit();
    });
  }

  async clear() {
    const db = this.#db;
    const name = this.#name;
    return new Promise<void>(function (resolve, reject) {
      const request = db
        .transaction(name, 'readwrite')
        .objectStore(name)
        .clear();
      request.onsuccess = () => resolve();
      request.onerror = reject;
    });
  }

  async loadAll(): Promise<Map<number, T>> {
    const db = this.#db;
    const name = this.#name;
    return new Promise(function (resolve, reject) {
      const result = new Map();
      const request = db
        .transaction(name, 'readonly')
        .objectStore(name)
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
}
