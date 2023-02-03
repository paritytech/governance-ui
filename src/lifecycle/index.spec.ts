import { expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import "fake-indexeddb/auto";
import { API_CACHE, DB_CACHE, useLifeCycle } from './index';
import { act } from 'react-dom/test-utils';

// Mock performance object, somehow undefined when running jest
window.performance.mark = jest.fn();
window.performance.measure = jest.fn();

test('reports', async () => {
  const {result} = renderHook(() => useLifeCycle());
  expect(result.current[0].reports).toBe(undefined);

  act(() => {
    result.current[1].addReport({type: 'Error', message: ''});
  });

  expect(result.current[0].reports?.length).toBe(1);

  act(() => {
    result.current[1].removeReport(0);
  });

  expect(result.current[0].reports?.length).toBe(0);

  await result.current[1].stop();
});
