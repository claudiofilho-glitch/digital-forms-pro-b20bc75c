ALTER TABLE service_orders
  ALTER COLUMN scheduled_date TYPE timestamptz
  USING scheduled_date::timestamptz;