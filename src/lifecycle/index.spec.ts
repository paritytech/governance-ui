import { expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { act } from 'react-dom/test-utils';
import { useAppLifeCycle } from './index.js';

// Mock performance object, somehow undefined when running jest
window.performance.mark = jest.fn();
window.performance.measure = jest.fn();

test.skip('reports', async () => {
  const { result } = renderHook(() => useAppLifeCycle());
  const { state, updater } = result.current;

  expect(state.reports).toBe(undefined);

  act(() => {
    updater.addReport({ type: 'Error', message: '' });
  });

  expect(state.reports?.length).toBe(1);

  act(() => {
    updater.removeReport(0);
  });

  expect(state.reports?.length).toBe(0);

  await updater.stop();
});
