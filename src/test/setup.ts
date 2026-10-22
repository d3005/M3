import '@testing-library/jest-dom/vitest';
// jsdom lacks matchMedia/scrollTo; stub them for component tests.
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    value: () => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }),
  });
}
