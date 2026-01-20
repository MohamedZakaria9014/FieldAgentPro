import { configureStore } from '@reduxjs/toolkit';

import shipmentsReducer from './shipmentsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    shipments: shipmentsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
