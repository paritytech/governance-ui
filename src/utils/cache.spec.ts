import { expect, test } from '@jest/globals';
import { Cache, Destroyable, Evictable, Readyable } from './cache';

class DummyReadyable implements Readyable<string> {
  ready: Promise<string>;
  constructor(arg: string) {
    this.ready = Promise.resolve(arg);
  }
}

class DestroyableReadyable implements Readyable<Destroyable> {
  ready: Promise<Destroyable>;
  static destroyed = false;
  constructor() {
    this.ready = Promise.resolve({
      destroy(): Promise<void> {
        return new Promise((resolve) => {
          DestroyableReadyable.destroyed = true;
          resolve();
        });
      },
    });
  }
}

class TriggeringEvictable implements Evictable {
  listener!: () => void | null;
  onEvict(listener: () => void) {
    this.listener = listener;
  }
  triggerEviction() {
    this.listener?.();
  }
}

class EvictableReadyable implements Readyable<TriggeringEvictable> {
  ready: Promise<TriggeringEvictable>;
  constructor() {
    this.ready = Promise.resolve(new TriggeringEvictable());
  }
}

test('cache does caches', async () => {
  const cache = new Cache<string, string>(DummyReadyable);
  expect(cache.keys.length).toBe(0);
  const arg = 'arg';
  const result = await cache.getOrCreate(arg);
  expect(result).toBe(arg);
  expect(cache.keys.length).toBe(1);

  const result2 = await cache.getOrCreate(arg);
  expect(result2).toBe(arg);
  expect(cache.keys.length).toBe(1);
});

test('cache does evict', async () => {
  const cache = new Cache<string, string>(DummyReadyable);
  expect(cache.keys.length).toBe(0);
  const arg = 'arg';
  const result = await cache.getOrCreate(arg);
  expect(result).toBe(arg);
  expect(cache.keys.length).toBe(1);

  expect(await cache.evict(arg)).toBe(arg);

  expect(cache.keys.length).toBe(0);

  const result2 = await cache.getOrCreate(arg);
  expect(result2).toBe(arg);
  expect(cache.keys.length).toBe(1);
});

test('cache does evictAll', async () => {
  const cache = new Cache<string, string>(DummyReadyable);
  expect(cache.keys.length).toBe(0);
  const arg = 'arg';
  const result = await cache.getOrCreate(arg);
  expect(result).toBe(arg);
  expect(cache.keys.length).toBe(1);

  await cache.evictAll();

  expect(cache.keys.length).toBe(0);

  const result2 = await cache.getOrCreate(arg);
  expect(result2).toBe(arg);
  expect(cache.keys.length).toBe(1);
});

test('cache does destroys', async () => {
  const cache = new Cache<Destroyable, void>(DestroyableReadyable);
  expect(cache.keys.length).toBe(0);

  await cache.getOrCreate();

  expect(cache.keys.length).toBe(1);
  expect(DestroyableReadyable.destroyed).toBe(false);

  await cache.evict();

  expect(DestroyableReadyable.destroyed).toBe(true);
});

test('cache does evict evictable', async () => {
  const cache = new Cache<TriggeringEvictable, void>(EvictableReadyable);
  expect(cache.keys.length).toBe(0);

  const evictable = await cache.getOrCreate();

  expect(cache.keys.length).toBe(1);

  evictable.triggerEviction();

  expect(cache.keys.length).toBe(0);
});
