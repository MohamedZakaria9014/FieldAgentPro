import { configureStore } from '@reduxjs/toolkit';

import shipmentsReducer, { setShipments } from '../redux/shipmentsSlice';

describe('shipmentsSlice', () => {
  it('dispatching setShipments updates state correctly', () => {
    const store = configureStore({
      reducer: {
        shipments: shipmentsReducer,
      },
      preloadedState: {
        shipments: {
          items: [],
          loading: false,
          error: undefined,
          lastSyncAt: undefined,
        },
      },
    });

    const payload = [
      {
        orderId: 2049,
        status: 'Active',
        customerName: 'John Doe',
        clientCompany: 'Acme Logistics Co.',
        deliveryAddress: '452 Willow Creek, Suite 101',
        contactPhone: null,
        deliveryDate: '2026-01-20T10:45:00.000Z',
        endTime: null,
        taskType: 'Delivery',
        latitude: 37.78825,
        longitude: -122.4324,
        notes: 'Gate code: 4492. Leave at front desk.',
        isDeleted: false,
        updatedAt: '2026-01-20T10:45:00.000Z',
      },
    ];

    store.dispatch(setShipments(payload));

    expect(store.getState().shipments.items).toHaveLength(1);
    expect(store.getState().shipments.items[0]?.orderId).toBe(2049);
  });
});
