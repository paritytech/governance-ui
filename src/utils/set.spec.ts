import { expect, test } from '@jest/globals';
import { areEquals } from './set.js';

test('empty sets are equals', () => {
  const s1 = new Set([]);
  const s2 = new Set([]);
  expect(areEquals(s1, s2)).toBeTruthy();
});

test('sets are equals', () => {
  const s1 = new Set([1, 2, 3]);
  const s2 = new Set([3, 2, 1]);
  expect(areEquals(s1, s2)).toBeTruthy();
});
