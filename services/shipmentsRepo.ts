import axios from 'axios';
import { and, desc, eq, like } from 'drizzle-orm';
import { Platform } from 'react-native';

import { db, sqlite } from '../db';
import {
  shipments,
  shipmentsOutbox,
  type ShipmentInsert,
  type ShipmentRow,
} from '../db/schema';
import { MOCK_SHIPMENTS, type MockShipmentApi } from './mockShipments';

export type Shipment = ShipmentRow;

const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

function mapApiToInsert(item: MockShipmentApi): ShipmentInsert {
  return {
    orderId: item.order_id,
    status: item.status,
    customerName: item.customer_name,
    clientCompany: item.client_company,
    deliveryAddress: item.delivery_address,
    contactPhone: item.contact_phone ?? null,
    deliveryDate: item.delivery_date,
    endTime: item.end_time ?? null,
    taskType: item.task_type,
    latitude: item.location_coordinates.latitude,
    longitude: item.location_coordinates.longitude,
    notes: item.notes ?? '',
    isDeleted: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function upsertShipmentsFromApi(): Promise<number> {
  try {
    // If we previously deleted while offline, try to flush those deletes first.
    await flushPendingDeletesToApi();

    const res = await axios.get<unknown>(`${API_BASE_URL}/shipments`, {
      timeout: 5000,
    });

    if (!Array.isArray(res.data)) {
      console.warn(
        'API /shipments returned non-array payload; skipping upsert.',
      );
      return 0;
    }

    const payload = res.data as MockShipmentApi[];
    console.log(`Fetched ${payload.length} shipments from API.`);

    // Reconcile: make local SQLite match the server snapshot.
    // We intentionally exclude shipments that are pending local deletes.
    const inserted = await applyServerSnapshotToLocal(payload);
    return inserted;
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? `${error.message} (status=${error.response?.status ?? 'n/a'})`
      : String(error);

    // Offline/server-down: do not overwrite local SQLite with mock data.
    console.warn(`API unreachable; using local SQLite only. ${message}`);
    return 0;
  }
}

export async function resetShipmentsFromMock(): Promise<number> {
  // Full reset so previously soft-deleted rows come back.
  await sqlite.execAsync('DELETE FROM shipments;');

  const rows = MOCK_SHIPMENTS.map(mapApiToInsert);
  for (const row of rows) {
    await db.insert(shipments).values(row);
  }

  // Best-effort: keep the API aligned too.
  try {
    await axios.post(`${API_BASE_URL}/reset-shipments`, {}, { timeout: 5000 });
  } catch {
    // ignore (offline / server down)
  }

  return rows.length;
}

export async function listShipments(): Promise<Shipment[]> {
  return db
    .select()
    .from(shipments)
    .where(eq(shipments.isDeleted, false))
    .orderBy(desc(shipments.deliveryDate));
}

export async function softDeleteShipment(orderId: number): Promise<void> {
  // Delete locally immediately.
  await db.delete(shipments).where(eq(shipments.orderId, orderId));

  // Queue for later if the server is offline.
  await db
    .insert(shipmentsOutbox)
    .values({
      opType: 'delete',
      orderId,
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing();

  // 2. Remote JSON Server update (Hard Delete)
  try {
    await axios.delete(`${API_BASE_URL}/shipments/${orderId}`, {
      timeout: 3000,
    });
    console.log(`Successfully deleted shipment ${orderId} from server.`);

    // Remove from outbox if delete succeeded.
    await db
      .delete(shipmentsOutbox)
      .where(eq(shipmentsOutbox.orderId, orderId));
  } catch (error) {
    // If server is offline, the local soft-delete still holds
    console.warn(
      `Server delete failed for ${orderId}. Device might be offline.`,
    );
  }
}

async function flushPendingDeletesToApi(): Promise<number> {
  const pending = await db
    .select({ id: shipmentsOutbox.id, orderId: shipmentsOutbox.orderId })
    .from(shipmentsOutbox)
    .where(eq(shipmentsOutbox.opType, 'delete'));

  let flushed = 0;
  for (const item of pending) {
    try {
      await axios.delete(`${API_BASE_URL}/shipments/${item.orderId}`, {
        timeout: 3000,
      });
      await db.delete(shipmentsOutbox).where(eq(shipmentsOutbox.id, item.id));
      flushed += 1;
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      // If it's already gone remotely, consider it synced.
      if (status === 404) {
        await db.delete(shipmentsOutbox).where(eq(shipmentsOutbox.id, item.id));
        flushed += 1;
        continue;
      }

      // Server still unreachable; stop early.
      break;
    }
  }

  return flushed;
}

async function applyServerSnapshotToLocal(
  payload: MockShipmentApi[],
): Promise<number> {
  const pendingDeletes = await db
    .select({ orderId: shipmentsOutbox.orderId })
    .from(shipmentsOutbox)
    .where(eq(shipmentsOutbox.opType, 'delete'));

  const pendingDeleteSet = new Set(pendingDeletes.map(r => r.orderId));
  const filteredPayload = payload.filter(
    p => !pendingDeleteSet.has(p.order_id),
  );

  // Replace local dataset to match server.
  // This is the simplest “server is source of truth when online” approach.
  await sqlite.execAsync('DELETE FROM shipments;');

  const rows = filteredPayload.map(mapApiToInsert);
  for (const row of rows) {
    await db.insert(shipments).values(row);
  }

  return rows.length;
}

export async function listShipmentsForDate(
  dateYYYYMMDD: string,
): Promise<Shipment[]> {
  // deliveryDate is ISO; match by prefix YYYY-MM-DD
  return db
    .select()
    .from(shipments)
    .where(
      and(
        eq(shipments.isDeleted, false),
        like(shipments.deliveryDate, `${dateYYYYMMDD}%`),
      ),
    )
    .orderBy(desc(shipments.deliveryDate));
}
