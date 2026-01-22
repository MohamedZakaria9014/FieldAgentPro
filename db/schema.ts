import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';

export const shipments = sqliteTable('shipments', {
  orderId: integer('order_id').primaryKey().notNull(),
  status: text('status').notNull(),
  customerName: text('customer_name').notNull(),
  clientCompany: text('client_company').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  contactPhone: text('contact_phone'),
  deliveryDate: text('delivery_date').notNull(),
  endTime: text('end_time'),
  taskType: text('task_type').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  notes: text('notes').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' })
    .notNull()
    .default(false),
  updatedAt: text('updated_at').notNull(),
});

export const shipmentsOutbox = sqliteTable('shipments_outbox', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  opType: text('op_type').notNull(),
  orderId: integer('order_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export type ShipmentRow = typeof shipments.$inferSelect;
export type ShipmentInsert = typeof shipments.$inferInsert;

export type ShipmentsOutboxRow = typeof shipmentsOutbox.$inferSelect;
