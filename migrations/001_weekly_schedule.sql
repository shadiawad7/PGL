-- Common recurring timetable. Monday=0, Sunday=6; an empty array means closed.
-- No existing sessions or bookings are changed.
CREATE TABLE IF NOT EXISTS weekly_schedule (
  weekday integer PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  minutes integer[] NOT NULL DEFAULT '{}',
  "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
