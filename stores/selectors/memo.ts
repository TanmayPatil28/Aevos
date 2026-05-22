/**
 * SSR-Safe, Request-Isolated Memoization Utility for Zustand selectors.
 * Uses a WeakMap keyed by the immutable USMStoreState reference to ensure
 * that cached computations are garbage-collected and request-isolated.
 */
export function createSelector<T extends object, R>(selectorFn: (state: T) => R): (state: T) => R {
  const cache = new WeakMap<T, R>();

  return (state: T) => {
    if (cache.has(state)) {
      return cache.get(state) as R;
    }
    const result = selectorFn(state);
    cache.set(state, result);
    return result;
  };
}
