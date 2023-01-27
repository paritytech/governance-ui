import { expect, test } from '@jest/globals';
import { capitalizeFirstLetter } from './string.js';

test('capitalize first letter', () => {
  expect(capitalizeFirstLetter('hello')).toBe('Hello');
  expect(capitalizeFirstLetter('Hello')).toBe('Hello');
});
