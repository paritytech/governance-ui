import { expect, test } from '@jest/globals';
import { extractSearchParams } from './search-params.js';

test('extract empty returns undefined', async () => {
  expect(await extractSearchParams('', [''])).toStrictEqual([null]);
});

test('extract one key', async () => {
  const key = 'key';
  const value = 'value';
  expect(await extractSearchParams(`${key}=${value}`, [key])).toStrictEqual([
    value,
  ]);
});

test('extract one key with one extra key', async () => {
  const key = 'key';
  const value = 'value';
  expect(
    await extractSearchParams(`${key}=${value}`, [key, 'extra'])
  ).toStrictEqual([value, null]);
});

test('extract one key with one extra param', async () => {
  const key = 'key';
  const value = 'value';
  expect(
    await extractSearchParams(`${key}=${value}&extra=extra`, [key])
  ).toStrictEqual([value]);
});

test('extract multiple keys', async () => {
  const key1 = 'key1';
  const value1 = 'value1';
  const key2 = 'key2';
  const value2 = 'value2';
  expect(
    await extractSearchParams(`${key1}=${value1}&${key2}=${value2}`, [
      key1,
      key2,
    ])
  ).toStrictEqual([value1, value2]);
});
