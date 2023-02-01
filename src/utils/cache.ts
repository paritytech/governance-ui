export interface Constructable<T, U> {
  new (params: U): Readyable<T>;
}

export interface Destroyable {
  destroy(): Promise<void>;
}

export interface Readyable<T> {
  ready: Promise<T>;
}

export interface Evictable {
  onEvict(listener: () => void): void;
}

function isDestroyable(o: any): o is Destroyable {
  return (o as Destroyable).destroy !== undefined;
}

function isEvictable(o: any): o is Evictable {
  return (o as Evictable).onEvict !== undefined;
}

/**
 * A simple cache keyed on instance constructor arguments.
 */
export class Cache<T, U> {
  readonly #instances = new Map<U, T>();
  #ctor;

  constructor(readonly ctor: Constructable<T, U>) {
    this.#ctor = ctor;
  }

  /**
   * An `Array<U>` of all currently cached keys.
   */
  get keys(): Array<U> {
    return Array.from(this.#instances.keys());
  }

  /**
   * @param args
   * @returns a cached T if exists, a newly create one otherwise
   */
  async getOrCreate(args: U): Promise<T> {
    const existingInstance = this.#instances.get(args);
    if (existingInstance) {
      return existingInstance;
    } else {
      const instance = new this.#ctor(args);
      const ready = await instance.ready;
      if (isEvictable(ready)) {
        ready.onEvict(() => this.evict(args));
      }
      this.#instances.set(args, ready);
      return ready;
    }
  }

  /**
   * Evict an instance keyed bi `args`. Handles `Destroyable`.
   * @param args
   * @returns
   */
  async evict(args: U): Promise<T | null> {
    const instance = this.#instances.get(args);
    if (instance) {
      this.#instances.delete(args);
      if (isDestroyable(instance)) {
        await instance.destroy();
      }
      return instance;
    }
    return null;
  }

  /**
   * Evict all instances.  Handles `Destroyable`.
   * @returns
   */
  async evictAll() {
    return Promise.all(this.keys.map(this.evict.bind(this)));
  }
}
