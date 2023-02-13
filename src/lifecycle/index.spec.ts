import { expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { act } from 'react-dom/test-utils';
import { useLifeCycle } from './index.js';

// Mock performance object, somehow undefined when running jest
window.performance.mark = jest.fn();
window.performance.measure = jest.fn();

test('reports', async () => {
  const { result } = renderHook(() => useLifeCycle());
  expect(result.current[0].reports).toBe(undefined);

  act(() => {
    result.current[1].addReport({ type: 'Error', message: '' });
  });

  expect(result.current[0].reports?.length).toBe(1);

  act(() => {
    result.current[1].removeReport(0);
  });

  expect(result.current[0].reports?.length).toBe(0);

  await result.current[1].stop();
});
