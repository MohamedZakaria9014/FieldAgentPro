import { listShipments, type Shipment } from './shipmentsRepo';

export function isoToYmd(iso: string): string {
  // 2026-01-20T10:45:00.000Z -> 2026-01-20
  return iso.slice(0, 10);
}

export function groupShipmentsByDay(
  shipments: Shipment[],
): Record<string, Shipment[]> {
  return shipments.reduce<Record<string, Shipment[]>>((acc, s) => {
    const day = isoToYmd(s.deliveryDate);
    acc[day] = acc[day] ?? [];
    acc[day].push(s);
    return acc;
  }, {});
}
