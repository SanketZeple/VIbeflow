import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the api module used by boardService - commented out because we mock boardService directly
// vi.mock('../services/api', () => ({
//   default: {
//     get: vi.fn(),
//     post: vi.fn(),
//     patch: vi.fn(),
//     delete: vi.fn(),
//     interceptors: {
//       request: { use: vi.fn() },
//       response: { use: vi.fn() },
//     },
//   },
// }));