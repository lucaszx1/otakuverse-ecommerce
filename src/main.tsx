/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Ensure window.fetch remains writable/configurable in iframe environments
try {
  const currentFetch = typeof window !== 'undefined' && typeof window.fetch === 'function'
    ? window.fetch.bind(window)
    : undefined;
  if (currentFetch && typeof window !== 'undefined') {
    let activeFetch = currentFetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return activeFetch;
      },
      set(fn) {
        if (typeof fn === 'function') {
          activeFetch = fn;
        }
      },
    });
  }
} catch {
  // Ignore if environment restricts defineProperty
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __OTAKUVERSE_MOUNTED__?: boolean;
  }
}

const rootEl = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (rootEl && !window.__OTAKUVERSE_MOUNTED__) {
  window.__OTAKUVERSE_MOUNTED__ = true;
  rootEl.innerHTML = '';
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
