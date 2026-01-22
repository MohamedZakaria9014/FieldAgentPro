import { configureStore } from '@reduxjs/toolkit';

import shipmentsReducer from './shipmentsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    shipments: shipmentsReducer,
    settings: settingsReducer,
  },
});

// Built-in React Native DevTools doesn't include a Redux panel.
// Expose the store so you can inspect state from the DevTools Console.
if (__DEV__) {
  (globalThis as any).__store = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
