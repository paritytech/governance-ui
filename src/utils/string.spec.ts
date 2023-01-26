import { expect, test } from '@jest/globals';
import { capitalizeFirstLetter } from './string';

test('capitalize first letter', () => {
  expect(capitalizeFirstLetter('hello')).toBe('Hello');
  expect(capitalizeFirstLetter('Hello')).toBe('Hello');
});
