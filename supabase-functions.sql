-- Function to get time series data of serial number generation
-- This function is used by the Statistics component to display generation trends
CREATE OR REPLACE FUNCTION get_serials_over_time(time_frame text, group_interval text)
RETURNS TABLE (
  date text,
  count bigint
) AS $$
BEGIN
  -- When grouping by day
  IF group_interval = 'day' THEN
    RETURN QUERY
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
      count(*) as count
    FROM
      serial_numbers
    WHERE
      "createdAt" >= (now() - time_frame::interval)
    GROUP BY
      date_trunc('day', "createdAt")
    ORDER BY
      date_trunc('day', "createdAt");
  
  -- When grouping by month
  ELSIF group_interval = 'month' THEN
    RETURN QUERY
    SELECT
      to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as date,
      count(*) as count
    FROM
      serial_numbers
    WHERE
      "createdAt" >= (now() - time_frame::interval)
    GROUP BY
      date_trunc('month', "createdAt")
    ORDER BY
      date_trunc('month', "createdAt");
  
  -- Default to daily grouping
  ELSE
    RETURN QUERY
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
      count(*) as count
    FROM
      serial_numbers
    WHERE
      "createdAt" >= (now() - time_frame::interval)
    GROUP BY
      date_trunc('day', "createdAt")
    ORDER BY
      date_trunc('day', "createdAt");
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the serial_numbers table if it doesn't exist
CREATE TABLE IF NOT EXISTS serial_numbers (
  id UUID PRIMARY KEY,
  "productName" TEXT NOT NULL,
  "batchId" UUID NOT NULL,
  "serialNumber" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "qrCode" TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial ON serial_numbers("serialNumber");
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers("productName");
CREATE INDEX IF NOT EXISTS idx_serial_numbers_batch ON serial_numbers("batchId");
CREATE INDEX IF NOT EXISTS idx_serial_numbers_date ON serial_numbers("createdAt");

-- Instructions for setting up this function in Supabase:
-- 1. Navigate to the Supabase SQL Editor
-- 2. Paste this code and run it
-- 3. The function will be available for your application 