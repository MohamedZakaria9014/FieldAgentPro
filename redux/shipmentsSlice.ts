import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initDb } from '../db/init';
import {
  listShipments,
  resetShipmentsFromMock,
  softDeleteShipment,
  type Shipment,
  upsertShipmentsFromApi,
} from '../services/shipmentsRepo';

type ShipmentsState = {
  items: Shipment[];
  loading: boolean;
  error?: string;
  lastSyncAt?: string;
};

const initialState: ShipmentsState = {
  items: [],
  loading: false,
};

export const bootstrapAndSyncShipments = createAsyncThunk(
  'shipments/bootstrapAndSync',
  async () => {
    await initDb();
    await upsertShipmentsFromApi();
    const rows = await listShipments();
    return { rows, syncedAt: new Date().toISOString() };
  },
);

export const refreshShipmentsFromDb = createAsyncThunk(
  'shipments/refreshFromDb',
  async () => {
    const rows = await listShipments();
    return rows;
  },
);

export const resetShipmentsToMock = createAsyncThunk(
  'shipments/resetToMock',
  async () => {
    await initDb();
    await resetShipmentsFromMock();
    const rows = await listShipments();
    return { rows, syncedAt: new Date().toISOString() };
  },
);

export const deleteShipmentById = createAsyncThunk(
  'shipments/deleteShipment',
  async (orderId: number) => {
    await softDeleteShipment(orderId);
    const rows = await listShipments();
    return rows;
  },
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    setShipments(state, action: PayloadAction<Shipment[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(bootstrapAndSyncShipments.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(bootstrapAndSyncShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.rows;
        state.lastSyncAt = action.payload.syncedAt;
      })
      .addCase(bootstrapAndSyncShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(resetShipmentsToMock.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(resetShipmentsToMock.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.rows;
        state.lastSyncAt = action.payload.syncedAt;
      })
      .addCase(resetShipmentsToMock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(refreshShipmentsFromDb.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(deleteShipmentById.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { setShipments } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;
