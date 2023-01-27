import { expect, test } from '@jest/globals';
import {
  DEFAULT_REASON,
  rejectAfter,
  resolveAfter,
  timeout,
} from './promise.js';

test('resolve resolves', async () => {
  const result = 'result';
  expect(await resolveAfter(1000, result)).toBe(result);
});

test('reject rejects', async () => {
  const reason = 'reason';
  try {
    await rejectAfter(1000, reason);
    // TODO replace with fail
    // Currently broken: https://github.com/facebook/jest/issues/11698
    throw new Error('Should not pass');
  } catch (e) {
    expect(e).toBe(reason);
  }
});

test('timeout returns', async () => {
  const result = 'result';
  expect(await timeout(Promise.resolve(result), 1000)).toBe(result);
});

test('timeout throws', async () => {
  const reason = 'reason';
  try {
    await timeout(Promise.reject(reason), 1000);
    throw new Error('Should not pass');
  } catch (e) {
    expect(e).toBe(reason);
  }

  await timeout(Promise.reject(reason), 1000)
    .then(() => {
      fail('Should not pass');
    })
    .catch((e) => {
      expect(e).toBe(reason);
    });
});

test('timeout timeouts', async () => {
  const timeoutInMs = 1000;
  const result = 'result';
  try {
    await timeout(resolveAfter(timeoutInMs * 2, result), timeoutInMs);
    throw new Error('Should not pass');
  } catch (e) {
    expect(e).toBe(DEFAULT_REASON);
  }

  const reason = 'reason';
  try {
    await timeout(resolveAfter(timeoutInMs * 2, result), timeoutInMs, reason);
    throw new Error('Should not pass');
  } catch (e) {
    expect(e).toBe(reason);
  }
});

test('timeout rejects', async () => {
  const timeoutInMs = 1000;
  const reason = 'reason';
  try {
    await timeout(rejectAfter(timeoutInMs, reason), timeoutInMs * 2);
    throw new Error('Should not pass');
  } catch (e) {
    expect(e).toBe(reason);
  }
});
