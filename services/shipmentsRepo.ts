import axios from 'axios';
import { and, desc, eq, like } from 'drizzle-orm';

import { db } from '../db';
import { shipments, type ShipmentInsert, type ShipmentRow } from '../db/schema';
import { MOCK_SHIPMENTS, type MockShipmentApi } from './mockShipments';

export type Shipment = ShipmentRow;

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
  // In the challenge, the API should be mocked. We still keep a network call here,
  // but always fall back to the injected dataset.
  let payload: MockShipmentApi[] = MOCK_SHIPMENTS;

  try {
    const res = await axios.get<MockShipmentApi[]>(
      'http://10.0.2.2:3000/shipments',
      {
        timeout: 5000,
      },
    );
    if (Array.isArray(res.data) && res.data.length > 0) payload = res.data;
  } catch {
    // offline / server not running -> use injected dataset
  }

  const rows = payload.map(mapApiToInsert);

  for (const row of rows) {
    await db
      .insert(shipments)
      .values(row)
      .onConflictDoUpdate({
        target: shipments.orderId,
        set: {
          status: row.status,
          customerName: row.customerName,
          clientCompany: row.clientCompany,
          deliveryAddress: row.deliveryAddress,
          contactPhone: row.contactPhone,
          deliveryDate: row.deliveryDate,
          endTime: row.endTime,
          taskType: row.taskType,
          latitude: row.latitude,
          longitude: row.longitude,
          notes: row.notes,
          // Preserve local delete decisions.
          updatedAt: row.updatedAt,
        },
      });
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
  await db
    .update(shipments)
    .set({ isDeleted: true, updatedAt: new Date().toISOString() })
    .where(eq(shipments.orderId, orderId));
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
